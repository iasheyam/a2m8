import { NextRequest, NextResponse } from "next/server";
import { getCallStatus, VapiError } from "@a2m8/integration-vapi";

export async function callStatusHandler(req: NextRequest) {
  const { callId, vapiApiKey } = await req.json();

  if (!callId) {
    return NextResponse.json({ error: "callId required" }, { status: 400 });
  }

  const apiKey = vapiApiKey || process.env.VAPI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "VAPI API key not configured" }, { status: 500 });
  }

  try {
    const status = await getCallStatus(callId, apiKey);
    return NextResponse.json(status);
  } catch (err) {
    if (err instanceof VapiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
