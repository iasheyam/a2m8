import { contactDisplayName, type Contact } from "../types/contact";

export function exportContactsCsv(contacts: Contact[]): void {
  const headers = [
    "Name", "Job Title", "Company", "Department",
    "Email", "Secondary Email", "Work Phone", "Mobile Phone", "Website", "LinkedIn",
    "Street", "City", "State", "Postal Code", "Country",
    "Type", "Status", "Source", "Summary", "Tags", "Created",
  ];
  const rows = contacts.map((c) => [
    contactDisplayName(c),
    c.jobTitle,
    c.company,
    c.department,
    c.email,
    c.secondaryEmail,
    c.phone,
    c.mobilePhone,
    c.website,
    c.linkedinUrl,
    c.street,
    c.city,
    c.state,
    c.postalCode,
    c.country,
    c.type,
    c.status,
    c.source,
    c.summary,
    c.tags.join("; "),
    c.createdAt,
  ]);

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv = [headers, ...rows]
    .map((row) => row.map((v) => escape(String(v))).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
