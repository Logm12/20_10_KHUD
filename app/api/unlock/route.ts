import { NextRequest, NextResponse } from "next/server";
import { findRecipientByBirthday, findRecipientByInviteCode, toPublicGift } from "@/lib/recipients.server";
import { isValidDate } from "@/lib/validation";
import { setRecipientSession } from "@/lib/session.server";

const GENERIC_ERROR_MESSAGE = "Hình như phong thư chưa tìm được đúng người rồi. Bạn kiểm tra lại thông tin một chút nhé!";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { recipientName, mode = "BIRTHDAY", birthDay, birthMonth, birthYear, inviteCode } = body;

    if (!recipientName || typeof recipientName !== "string" || !recipientName.trim()) {
      return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 400 });
    }

    let matchedRecipient = null;

    if (mode === "INVITE_CODE" || Boolean(inviteCode)) {
      if (!inviteCode || typeof inviteCode !== "string") {
        return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 400 });
      }
      matchedRecipient = await findRecipientByInviteCode(recipientName, inviteCode);
    } else {
      // Birthday mode
      const day = Number(birthDay);
      const month = Number(birthMonth);
      const year = birthYear ? Number(birthYear) : null;

      if (!isValidDate(day, month, year)) {
        return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 400 });
      }

      matchedRecipient = await findRecipientByBirthday(recipientName, day, month, year);
    }

    if (!matchedRecipient) {
      return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 400 });
    }

    // Set signed HttpOnly session cookie
    await setRecipientSession(matchedRecipient.id);

    // Return only safe public gift data
    const publicGift = toPublicGift(matchedRecipient);
    return NextResponse.json({ success: true, gift: publicGift }, { status: 200 });
  } catch (error) {
    console.error("Unlock API error:", error);
    return NextResponse.json({ success: false, message: GENERIC_ERROR_MESSAGE }, { status: 500 });
  }
}
