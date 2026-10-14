import { NextResponse } from "next/server";
import { getSessionRecipientId } from "@/lib/session.server";
import { getRecipientById, toPublicGift } from "@/lib/recipients.server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const recipientId = await getSessionRecipientId();
    if (!recipientId) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const recipient = await getRecipientById(recipientId);
    if (!recipient) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      gift: toPublicGift(recipient),
    });
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
