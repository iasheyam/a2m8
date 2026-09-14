// Fields that can either come from an automated source (mail signature
// extraction, once that ships) or be set by hand. Never write a manual edit
// into the same store an extraction writes to — see ContactFact vs
// ContactOverride below. Tags are manual-only, so they live outside this set.
export type ContactField = "name" | "company" | "phone" | "email" | "type";

// The identity row. Everything else about a contact is derived at read time
// from facts + overrides + tags, keyed off this id.
export type ContactRecord = {
  id: string;
  createdAt: string;
};

// Written by an automated extraction source. Append-only: a new run inserts
// a new fact, it never updates or deletes a prior one.
export type ContactFact = {
  id: string;
  contactId: string;
  field: ContactField;
  value: string;
  source: string;
  extractedAt: string;
};

// Written by a human. Always wins over a fact for the same field, regardless
// of which was written more recently.
export type ContactOverride = {
  contactId: string;
  field: ContactField;
  value: string;
  updatedAt: string;
};

// The read-time merge that the rest of the app actually consumes.
export type Contact = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  type: string;
  tags: string[];
  createdAt: string;
};
