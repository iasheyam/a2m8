import type { Contact } from "../types/contact";

export function exportContactsCsv(contacts: Contact[]): void {
  const headers = ["Name", "Company", "Phone", "Email", "Type", "Tags", "Created"];
  const rows = contacts.map((c) => [
    c.name,
    c.company,
    c.phone,
    c.email,
    c.type,
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
