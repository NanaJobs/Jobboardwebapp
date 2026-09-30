import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, CheckCircle2, AlertCircle, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "./Jobs";
import { authApi } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.requestPasswordReset(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please check the email address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <SiteHeader />
      <main className="mx-auto max-w-md px-5 py-20 flex-1 flex items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6">
            <KeyRound className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t("Forgot Password")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("Enter your account email address and we'll send you a secure password reset link.")}
          </p>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h3 className="mt-4 font-bold text-emerald-950">{t("Reset Link Sent!")}</h3>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folders.
              </p>
              <Button asChild className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Link to="/login">{t("Back to Sign In")}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                {t("Email Address")}
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${inputClass} mt-1.5`}
                  placeholder="you@example.com"
                />
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 mt-2"
              >
                {loading ? t("Sending link...") || "Sending link..." : t("Send Reset Link")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-bold text-blue-600 hover:underline">
                  ← {t("Back to Sign In")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
