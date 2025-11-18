// src/features/surveys/ShareDialog.tsx
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export function ShareDialog({
  link,
  category,
  survey,
  shareId,
  onClose,
}: {
  link: string;
  category: string;
  survey: string;
  shareId?: string;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(`Survey: ${survey}`);
  const [sending, setSending] = useState(false);

  async function sendMail() {
    try {
      if (!to) {
        toast.error("Please enter recipient email");
        return;
      }
      setSending(true);

      await api.post(
        "/survey-api/sendEmail",
        {
          to,
          subject,
          category_name: category,
          survey_name: survey,
          link,
          share: shareId,
        },
        token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : undefined
      );

      toast.success("Invitation email sent (or queued)!");
      setTo("");
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to send email";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      {/* Card */}
      <div className="w-full max-w-lg rounded-2xl bg-white text-slate-900 p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Share survey</h3>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {/* Link + QR */}
        <div className="mb-4 rounded-xl border border-slate-200 p-4">
          <div className="mb-2 text-sm text-slate-600">Public link</div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
              readOnly
              value={link}
            />
            <QRCodeSVG value={link} size={84} />
          </div>
        </div>

        {/* Email share */}
        <div className="space-y-3 rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-800">
            Send via email
          </div>
          <input
            type="email"
            placeholder="recipient@example.com"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <button
            onClick={sendMail}
            disabled={!to || sending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
