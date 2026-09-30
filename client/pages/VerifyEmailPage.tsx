import React, { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "./Jobs";
import { API_BASE_URL } from "@/lib/api";
import { useLocale } from "@/lib/i18n";

export default function VerifyEmailPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link. Token or email is missing.");
      return;
    }

    // Call backend verification
    fetch(`${API_BASE_URL}/api/auth/verify-email/?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Your email address has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. The link may have expired or already been used.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Network error occurred while verifying your account. Please try again.");
      });
  }, [token, email]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <SiteHeader />
      <main className="mx-auto max-w-lg px-5 py-20 text-center flex-1 flex items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          {status === "loading" && (
            <div className="py-8">
              <Loader2 className="mx-auto h-12 w-12 text-blue-600 animate-spin" />
              <h2 className="mt-5 text-2xl font-bold text-slate-950">{t("Verifying Email...")}</h2>
              <p className="mt-2 text-sm text-slate-500">{t("Please wait while we activate your account.")}</p>
            </div>
          )}

          {status === "success" && (
            <div className="py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">{t("Email Verified!")}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
              <div className="mt-8">
                <Button asChild className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20">
                  <Link to="/login">
                    {t("Proceed to Sign In")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="py-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">{t("Verification Failed")}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{message}</p>
              <div className="mt-8 flex flex-col gap-3">
                <Button asChild className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold">
                  <Link to="/login">{t("Sign in")}</Link>
                </Button>
                <Button asChild variant="outline" className="h-12 w-full rounded-xl">
                  <Link to="/register">{t("Create an account")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
