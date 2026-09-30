import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "./Jobs";
import { authApi } from "@/lib/api";
import { PasswordStrengthMeter, evaluatePassword } from "@/components/PasswordStrengthMeter";
import { useLocale } from "@/lib/i18n";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !email) {
      setError("Invalid password reset link. Missing token or email parameter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { score } = evaluatePassword(newPassword);
    if (score < 2) {
      setError("Please choose a stronger password matching all security requirements.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authApi.confirmPasswordReset({
        email,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
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
            <Lock className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{t("Set New Password")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t("Create a strong, secure password for")} <strong>{email || "your account"}</strong>.
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
              <h3 className="mt-4 font-bold text-emerald-950">{t("Password Reset Complete!")}</h3>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                Your password has been updated successfully. You can now sign in with your new credentials.
              </p>
              <Button asChild className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">
                <Link to="/login">{t("Sign In with New Password")} →</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t("New Password")}
                </label>
                <div className="relative mt-1.5">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t("Confirm New Password")}
                </label>
                <div className="relative mt-1.5">
                  <input
                    required
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputClass} pr-11`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 mt-3"
              >
                {loading ? t("Updating...") : t("Reset Password")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
