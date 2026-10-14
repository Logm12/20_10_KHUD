"use client";

import React, { useState } from "react";
import { Sparkles, KeyRound, Calendar, Loader2, AlertCircle } from "lucide-react";
import { RecipientPublicGift } from "@/types/recipient";

interface GiftUnlockFormProps {
  onUnlockSuccess: (gift: RecipientPublicGift) => void;
}

export default function GiftUnlockForm({ onUnlockSuccess }: GiftUnlockFormProps) {
  const [recipientName, setRecipientName] = useState("");
  const [mode, setMode] = useState<"BIRTHDAY" | "INVITE_CODE">("BIRTHDAY");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!recipientName.trim()) {
      setErrorMessage("Bạn hãy nhập tên để phong thư tìm đúng người nhé!");
      return;
    }

    if (mode === "BIRTHDAY") {
      if (!birthDay || !birthMonth || !birthYear) {
        setErrorMessage("Vui lòng điền đầy đủ ngày, tháng và năm sinh nhé.");
        return;
      }
    } else {
      if (!inviteCode.trim()) {
        setErrorMessage("Vui lòng nhập mã mở thư bí mật.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          mode,
          birthDay: birthDay ? parseInt(birthDay, 10) : undefined,
          birthMonth: birthMonth ? parseInt(birthMonth, 10) : undefined,
          birthYear: birthYear ? parseInt(birthYear, 10) : undefined,
          inviteCode: inviteCode.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.gift) {
        onUnlockSuccess(data.gift);
      } else {
        setErrorMessage(
          data.message ||
            "Hình như phong thư chưa tìm được đúng người rồi. Bạn kiểm tra lại thông tin một chút nhé!"
        );
      }
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Bạn vui lòng thử lại sau giây lát nhé!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-ivory-100 rounded-2xl p-6 sm:p-8 vintage-border shadow-letter max-w-lg mx-auto space-y-6"
    >
      {/* Mode selection tabs */}
      <div className="flex rounded-xl bg-blush/40 p-1 border border-blush">
        <button
          type="button"
          onClick={() => {
            setMode("BIRTHDAY");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "BIRTHDAY"
              ? "bg-ivory text-plum shadow-sm"
              : "text-plum/70 hover:text-plum"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Mở bằng ngày sinh</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("INVITE_CODE");
            setErrorMessage("");
          }}
          className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            mode === "INVITE_CODE"
              ? "bg-ivory text-plum shadow-sm"
              : "text-plum/70 hover:text-plum"
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Mình có mã mở thư</span>
        </button>
      </div>

      {/* Recipient Name Input */}
      <div className="space-y-1.5 text-left">
        <label htmlFor="recipient-name" className="block text-xs font-semibold text-plum tracking-wider uppercase">
          Tên hiển thị của bạn
        </label>
        <input
          id="recipient-name"
          type="text"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          placeholder="Ví dụ: Thị Huyền, Ánh Dương, Nhật Lệ..."
          className="w-full px-4 py-3 rounded-xl bg-ivory border border-dusty/30 text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-dusty/40 focus:border-dusty transition-all text-sm"
          disabled={isLoading}
          required
        />
        <p className="text-[11px] text-plum/60 italic">
          *Gợi ý: Nhập tên hai từ cuối hoặc họ tên đầy đủ của bạn.
        </p>
      </div>

      {/* Birthday Inputs */}
      {mode === "BIRTHDAY" ? (
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-plum tracking-wider uppercase">
            Ngày / Tháng / Năm sinh
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Day */}
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              className="px-3 py-3 rounded-xl bg-ivory border border-dusty/30 text-plum focus:outline-none focus:ring-2 focus:ring-dusty/40 text-sm"
              disabled={isLoading}
              required
            >
              <option value="">Ngày</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d < 10 ? `0${d}` : d}
                </option>
              ))}
            </select>

            {/* Month */}
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              className="px-3 py-3 rounded-xl bg-ivory border border-dusty/30 text-plum focus:outline-none focus:ring-2 focus:ring-dusty/40 text-sm"
              disabled={isLoading}
              required
            >
              <option value="">Tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m < 10 ? `0${m}` : m}
                </option>
              ))}
            </select>

            {/* Year */}
            <input
              type="number"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="Năm sinh"
              min="1990"
              max="2015"
              className="px-3 py-3 rounded-xl bg-ivory border border-dusty/30 text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-dusty/40 text-sm"
              disabled={isLoading}
              required
            />
          </div>
        </div>
      ) : (
        /* Invite Code Input */
        <div className="space-y-1.5 text-left">
          <label htmlFor="invite-code" className="block text-xs font-semibold text-plum tracking-wider uppercase">
            Mã mở thư bí mật
          </label>
          <input
            id="invite-code"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Nhập mã mở thư được gửi riêng..."
            className="w-full px-4 py-3 rounded-xl bg-ivory border border-dusty/30 text-plum placeholder-plum/40 focus:outline-none focus:ring-2 focus:ring-dusty/40 font-mono text-sm tracking-wider uppercase"
            disabled={isLoading}
            required
          />
          <p className="text-[11px] text-plum/60 italic">
            *Dành riêng cho thư mời đặc biệt hoặc khi ngày sinh chưa xác minh.
          </p>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-blush/60 border border-dusty/30 text-plum-dark text-xs flex items-start gap-2.5 text-left animate-shake">
          <AlertCircle className="w-4 h-4 text-dusty flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl bg-dusty hover:bg-dusty-dark text-ivory font-medium shadow-vintage transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-ivory" />
            <span>Đang tìm phong thư của bạn...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-ivory" />
            <span>Mở món quà của mình ✨</span>
          </>
        )}
      </button>
    </form>
  );
}
