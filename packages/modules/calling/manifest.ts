export const manifest = {
  id: "calling",
  tables: ["campaigns", "calling_contacts", "calls"],
  requires: ["voice.call"],
} as const;
