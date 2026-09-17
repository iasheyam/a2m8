import type {
  Contact,
  ContactField,
  ContactFact,
  ContactOverride,
  ContactRecord,
} from "../types/contact";

const RECORDS_KEY = "a2m8_contact_records";
const FACTS_KEY = "a2m8_contact_facts";
const OVERRIDES_KEY = "a2m8_contact_overrides";
const TAGS_KEY = "a2m8_contact_tags";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function getRecords(): ContactRecord[] {
  return read<ContactRecord>(RECORDS_KEY);
}

function getFacts(): ContactFact[] {
  return read<ContactFact>(FACTS_KEY);
}

function getOverrides(): ContactOverride[] {
  return read<ContactOverride>(OVERRIDES_KEY);
}

function getTagsMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TAGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function saveTagsMap(map: Record<string, string[]>): void {
  localStorage.setItem(TAGS_KEY, JSON.stringify(map));
}

const FIELD_DEFAULTS: Record<ContactField, string> = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  company: "",
  department: "",
  email: "",
  secondaryEmail: "",
  phone: "",
  mobilePhone: "",
  website: "",
  linkedinUrl: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  type: "",
  status: "",
  source: "",
  summary: "",
};

// A manual override always wins over an extracted fact for the same field,
// regardless of which was written more recently. This is what lets a hand
// edit survive a future re-extraction run without a per-column "locked" flag.
function resolveField(
  contactId: string,
  field: ContactField,
  facts: ContactFact[],
  overrides: ContactOverride[]
): string {
  const override = overrides.find((o) => o.contactId === contactId && o.field === field);
  if (override) return override.value;

  const latestFact = facts
    .filter((f) => f.contactId === contactId && f.field === field)
    .sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime())[0];
  return latestFact?.value ?? FIELD_DEFAULTS[field];
}

const ALL_FIELDS = Object.keys(FIELD_DEFAULTS) as ContactField[];

export function getContacts(): Contact[] {
  const records = getRecords();
  const facts = getFacts();
  const overrides = getOverrides();
  const tagsMap = getTagsMap();

  return records.map((r) => {
    const resolved = Object.fromEntries(
      ALL_FIELDS.map((field) => [field, resolveField(r.id, field, facts, overrides)])
    ) as Record<ContactField, string>;

    return {
      id: r.id,
      ...resolved,
      tags: tagsMap[r.id] ?? [],
      createdAt: r.createdAt,
    };
  });
}

export function getContact(id: string): Contact | undefined {
  return getContacts().find((c) => c.id === id);
}

export function createContact(input: Partial<Record<ContactField, string>>): Contact {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  write(RECORDS_KEY, [...getRecords(), { id, createdAt }]);

  const now = new Date().toISOString();
  const newOverrides: ContactOverride[] = ALL_FIELDS
    .filter((field) => !!input[field]?.trim())
    .map((field) => ({ contactId: id, field, value: input[field]!.trim(), updatedAt: now }));
  write(OVERRIDES_KEY, [...getOverrides(), ...newOverrides]);

  return getContact(id)!;
}

// Every manual edit goes here, in contact_overrides — never into
// contact_facts, which is append-only and owned by extraction.
export function updateContactField(contactId: string, field: ContactField, value: string): void {
  const overrides = getOverrides().filter(
    (o) => !(o.contactId === contactId && o.field === field)
  );
  overrides.push({ contactId, field, value, updatedAt: new Date().toISOString() });
  write(OVERRIDES_KEY, overrides);
}

export function updateContactFields(contactId: string, fields: Partial<Record<ContactField, string>>): void {
  const now = new Date().toISOString();
  const overrides = getOverrides().filter(
    (o) => !(o.contactId === contactId && o.field in fields)
  );
  for (const field of Object.keys(fields) as ContactField[]) {
    overrides.push({ contactId, field, value: fields[field] ?? "", updatedAt: now });
  }
  write(OVERRIDES_KEY, overrides);
}

export function setContactTags(contactId: string, tags: string[]): void {
  const map = getTagsMap();
  map[contactId] = tags;
  saveTagsMap(map);
}

export function deleteContact(id: string): void {
  write(RECORDS_KEY, getRecords().filter((r) => r.id !== id));
  write(FACTS_KEY, getFacts().filter((f) => f.contactId !== id));
  write(OVERRIDES_KEY, getOverrides().filter((o) => o.contactId !== id));
  const map = getTagsMap();
  delete map[id];
  saveTagsMap(map);
}
