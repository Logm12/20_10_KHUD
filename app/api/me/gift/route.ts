import { NextResponse } from "next/server";
import { getSessionRecipientId } from "@/lib/session.server";
import { getRecipientById, toPublicGift } from "@/lib/recipients.server";

export const dynamic = "force-dynamic";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

export async function GET() {
  try {
    const recipientId = await getSessionRecipientId();
    if (!recipientId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    const recipient = await getRecipientById(recipientId);
    if (!recipient) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        authenticated: true,
        gift: toPublicGift(recipient),
      },
      { status: 200, headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Me API error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}
