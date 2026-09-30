import React, { useState } from "react";
import { Flag, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: "job" | "user";
  targetId: string;
  targetTitle?: string;
}

export function ReportModal({ isOpen, onClose, targetType, targetId, targetTitle }: ReportModalProps) {
  const [reason, setReason] = useState("spam_or_scam");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        target_type: targetType,
        reason,
        description,
        evidence_url: evidenceUrl,
      };
      if (targetType === "job") {
        payload.job_id = targetId;
      } else {
        payload.user_id = targetId;
      }

      await reportsApi.submit(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-950">Report {targetType === "job" ? "Job Posting" : "Account"}</h3>
              {targetTitle && <p className="text-xs text-slate-500 truncate max-w-[240px]">{targetTitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h4 className="mt-3 text-lg font-bold text-slate-950">Report Submitted</h4>
            <p className="mt-1 text-sm text-slate-500">Our moderation team has received your report and will investigate.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
              >
                <option value="spam_or_scam">Spam, Fraud, or Scam</option>
                <option value="fake_job">Fake or Misleading Job</option>
                <option value="inappropriate_content">Inappropriate or Offensive Content</option>
                <option value="harassment">Harassment or Threatening Behavior</option>
                <option value="discrimination">Discriminatory Language or Practice</option>
                <option value="impersonation">Impersonation or False Identity</option>
                <option value="other">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Description (min 10 characters)
              </label>
              <textarea
                required
                minLength={10}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe why you are reporting this content..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Evidence URL (Optional)</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://imgur.com/screenshot or document link"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-red-600 hover:bg-red-700 text-white">
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
