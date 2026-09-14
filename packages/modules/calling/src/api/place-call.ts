import { NextRequest, NextResponse } from "next/server";
import { placeCall, VapiError } from "@a2m8/integration-vapi";

export async function placeCallHandler(req: NextRequest) {
  const { phone, name, company, vapiApiKey, vapiPhoneNumberId, vapiAssistantId, agentName } =
    await req.json();

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  const apiKey = vapiApiKey || process.env.VAPI_API_KEY;
  const phoneNumberId = vapiPhoneNumberId || process.env.VAPI_PHONE_NUMBER_ID;
  const assistantId = vapiAssistantId || process.env.VAPI_ASSISTANT_ID;

  if (!apiKey || !phoneNumberId || !assistantId) {
    return NextResponse.json(
      { error: "VAPI credentials not configured. Add them in Settings." },
      { status: 500 }
    );
  }

  try {
    const data = await placeCall({
      apiKey,
      phoneNumberId,
      assistantId,
      customerNumber: phone,
      customerName: name ?? "",
      variableValues: {
        agent_name: agentName || "Alex",
        business_name: company || "",
        owner_name: name || "",
      },
    });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof VapiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
