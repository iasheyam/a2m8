export type CallOutcome =
  | "interested"
  | "callback"
  | "no_answer"
  | "voicemail"
  | "not_interested";

export type CallLog = {
  id: string;
  contactId: string;
  contactName: string;
  company: string;
  phone: string;
  calledAt: string;
  vapiCallId?: string;
  outcome?: CallOutcome;
  polled?: boolean;
  transcript?: string;
  duration?: number;
  endedReason?: string;
};
