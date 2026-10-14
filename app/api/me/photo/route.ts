import { NextRequest, NextResponse } from "next/server";
import { getSessionRecipientId } from "@/lib/session.server";
import { getPhotoForRecipient } from "@/lib/photo-storage.server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const recipientId = await getSessionRecipientId();
    if (!recipientId) {
      return NextResponse.json(
        { error: "Vui lòng mở quà trước để xem ảnh riêng tư." },
        { status: 401 }
      );
    }

    const photo = await getPhotoForRecipient(recipientId);
    if (!photo) {
      return NextResponse.json(
        { error: "Ảnh đang được cập nhật." },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(photo.buffer), {
      status: 200,
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Photo API error:", error);
    return NextResponse.json({ error: "Lỗi xử lý ảnh." }, { status: 500 });
  }
}
