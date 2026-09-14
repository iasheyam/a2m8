export type PlaceCallInput = {
  apiKey: string;
  phoneNumberId: string;
  assistantId: string;
  customerNumber: string;
  customerName?: string;
  variableValues?: Record<string, string>;
};

export type PlaceCallResult = {
  id: string;
  [key: string]: unknown;
};

export type CallStatus = {
  status: string;
  transcript: string | null;
  endedReason: string | null;
  duration?: number;
};
