import type { CallStatus, PlaceCallInput, PlaceCallResult } from "./types";

const VAPI_BASE_URL = "https://api.vapi.ai";

export class VapiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function placeCall(input: PlaceCallInput): Promise<PlaceCallResult> {
  const res = await fetch(`${VAPI_BASE_URL}/call/phone`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumberId: input.phoneNumberId,
      assistantId: input.assistantId,
      assistantOverrides: {
        variableValues: input.variableValues ?? {},
      },
      customer: { number: input.customerNumber, name: input.customerName ?? "" },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new VapiError(data.message ?? "VAPI error", res.status);
  }

  return data;
}

export async function getCallStatus(callId: string, apiKey: string): Promise<CallStatus> {
  const res = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new VapiError(data.message ?? "VAPI error", res.status);
  }

  const startedAt = data.startedAt ? new Date(data.startedAt).getTime() : null;
  const endedAt = data.endedAt ? new Date(data.endedAt).getTime() : null;
  const duration =
    startedAt && endedAt ? Math.round((endedAt - startedAt) / 1000) : undefined;

  return {
    status: data.status,
    transcript: data.transcript ?? null,
    endedReason: data.endedReason ?? null,
    duration,
  };
}
