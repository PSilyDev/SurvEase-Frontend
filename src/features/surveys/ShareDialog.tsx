// src/features/surveys/ShareDialog.tsx
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
// ✅ Correct
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export function ShareDialog({
  link,
  category,
  survey,
  shareId,           // optional, if you have it from publish
  onClose
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
      setSending(true);
      await api.post(
        "/survey-api/sendEmail",
        {
          to,
          subject,
          category_name: category,
          survey_name: survey,
          link,            // pass the exact link you're showing
          share: shareId,  // in case backend wants it
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Invitation email sent!");
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
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share survey</h3>
          <button onClick={onClose} className="rounded px-2 py-1 hover:bg-gray-100">✕</button>
        </div>

        {/* Link + QR */}
        <div className="rounded-xl border p-4 mb-4">
          <div className="text-sm text-gray-600 mb-2">Public link</div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input className="flex-1 rounded border px-3 py-2" readOnly value={link} />
            <QRCodeSVG value={link} size={84} />
          </div>
        </div>

        {/* Email share */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="text-sm font-medium">Send via email</div>
          <input
            type="email"
            placeholder="recipient@example.com"
            className="w-full rounded border px-3 py-2"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Subject"
            className="w-full rounded border px-3 py-2"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <button
            onClick={sendMail}
            disabled={!to || sending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
