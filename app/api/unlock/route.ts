import { NextRequest, NextResponse } from "next/server";
import { findRecipientByBirthday, findRecipientByInviteCode, toPublicGift } from "@/lib/recipients.server";
import { isValidDate } from "@/lib/validation";
import { setRecipientSession } from "@/lib/session.server";
import { checkRateLimit } from "@/lib/rate-limiter.server";

const GENERIC_ERROR_MESSAGE = "Hình như phong thư chưa tìm được đúng người rồi. Bạn kiểm tra lại thông tin một chút nhé!";
const RATE_LIMIT_MESSAGE = "Bạn thao tác hơi nhanh rồi. Vui lòng thử lại sau giây lát nhé!";

const PRIVATE_CACHE_HEADERS = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
  Vary: "Cookie",
};

export async function POST(req: NextRequest) {
  // 1. IP Rate Limiting (A06)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "127.0.0.1";

  const rateCheck = checkRateLimit(`unlock:${ip}`, 10, 60 * 1000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { success: false, message: RATE_LIMIT_MESSAGE },
      {
        status: 429,
        headers: {
          ...PRIVATE_CACHE_HEADERS,
          "Retry-After": String(rateCheck.retryAfterSeconds),
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: GENERIC_ERROR_MESSAGE },
        { status: 400, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    const { recipientName, mode = "BIRTHDAY", birthDay, birthMonth, birthYear, inviteCode } = body;

    // Validate name
    if (!recipientName || typeof recipientName !== "string" || !recipientName.trim() || recipientName.length > 100) {
      return NextResponse.json(
        { success: false, message: GENERIC_ERROR_MESSAGE },
        { status: 400, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    let matchedRecipient = null;

    // Strict mode dispatch (A09: mode determines branch; presence of inviteCode does not override BIRTHDAY)
    if (mode === "INVITE_CODE") {
      if (!inviteCode || typeof inviteCode !== "string" || !inviteCode.trim() || inviteCode.length > 64) {
        return NextResponse.json(
          { success: false, message: GENERIC_ERROR_MESSAGE },
          { status: 400, headers: PRIVATE_CACHE_HEADERS }
        );
      }
      matchedRecipient = await findRecipientByInviteCode(recipientName, inviteCode.trim());
    } else if (mode === "BIRTHDAY") {
      const day = Number(birthDay);
      const month = Number(birthMonth);
      const year = birthYear ? Number(birthYear) : null;

      if (!isValidDate(day, month, year)) {
        return NextResponse.json(
          { success: false, message: GENERIC_ERROR_MESSAGE },
          { status: 400, headers: PRIVATE_CACHE_HEADERS }
        );
      }

      matchedRecipient = await findRecipientByBirthday(recipientName, day, month, year);
    } else {
      // Invalid mode
      return NextResponse.json(
        { success: false, message: GENERIC_ERROR_MESSAGE },
        { status: 400, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    if (!matchedRecipient) {
      return NextResponse.json(
        { success: false, message: GENERIC_ERROR_MESSAGE },
        { status: 400, headers: PRIVATE_CACHE_HEADERS }
      );
    }

    // Set signed HttpOnly session cookie
    await setRecipientSession(matchedRecipient.id);

    // Return only safe public gift data with private no-cache headers (A08)
    const publicGift = toPublicGift(matchedRecipient);
    return NextResponse.json(
      { success: true, gift: publicGift },
      { status: 200, headers: PRIVATE_CACHE_HEADERS }
    );
  } catch (error) {
    console.error("Unlock API error:", error);
    return NextResponse.json(
      { success: false, message: GENERIC_ERROR_MESSAGE },
      { status: 500, headers: PRIVATE_CACHE_HEADERS }
    );
  }
}
