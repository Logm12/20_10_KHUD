import { NextResponse } from "next/server";
import { clearRecipientSession } from "@/lib/session.server";

export const dynamic = "force-dynamic";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

export async function POST() {
  try {
    await clearRecipientSession();
    return NextResponse.json({ success: true }, { status: 200, headers: PRIVATE_CACHE_HEADERS });
  } catch (error) {
    console.error("Reset session error:", error);
    return NextResponse.json({ success: false }, { status: 500, headers: PRIVATE_CACHE_HEADERS });
  }
}
