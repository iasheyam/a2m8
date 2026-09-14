export type ContactEventKind = "note" | "reminder";

export type ContactEvent = {
  id: string;
  contactId: string;
  kind: ContactEventKind;
  text: string;
  dueAt?: string;
  completed?: boolean;
  createdAt: string;
};
