import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Heart,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Eye,
  Flag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "./Jobs";
import { jobsApi, applicationsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useLocale } from "@/lib/i18n";
import { formatSalary } from "@/lib/currency";
import { ReportModal } from "@/components/ReportModal";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply Modal State
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Report Modal State
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobsApi
      .getDetail(id)
      .then((res) => {
        if (res.data) setJob(res.data);
        else setJob(res);
      })
      .catch((err) => {
        setError(err.message || "Failed to load job details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setApplyLoading(true);
    setApplyError(null);

    try {
      await applicationsApi.apply(job.id, {
        resume_url: resumeUrl,
        cover_letter: coverLetter,
      });
      setApplySuccess(true);
      setTimeout(() => {
        setIsApplyOpen(false);
        setApplySuccess(false);
        navigate("/applicant/applications");
      }, 2000);
    } catch (err: any) {
      setApplyError(err.message || "Failed to submit application.");
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-5 py-20 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-500 font-medium">Loading position details...</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#f8fafc]">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-5 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-950">Job Not Found</h2>
          <p className="mt-2 text-slate-500">{error || "This role may have expired or been closed."}</p>
          <Button asChild className="mt-6 rounded-xl bg-blue-600">
            <Link to="/jobs">← Back to all jobs</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { t, locale } = useLocale();
  const initial = job.company_name ? job.company_name[0].toUpperCase() : "C";
  const salaryText = formatSalary(job, locale);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
            ← {t("Back to jobs")}
          </Link>
          <button
            onClick={() => setIsReportOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-600 transition"
          >
            <Flag className="h-3.5 w-3.5" /> {t("Report job")}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700">
              {initial}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{job.title}</h1>
                {job.is_featured && (
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 uppercase tracking-wider">
                    {t("Featured")}
                  </span>
                )}
              </div>
              <p className="mt-2 text-lg font-medium text-slate-600">{job.company_name}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 font-medium">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {job.location} ({t(job.workplace_type)})
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 font-semibold text-blue-700 capitalize">
                  <Briefcase className="h-4 w-4" />
                  {t(job.job_type.replace("_", " "))}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                  <DollarSign className="h-4 w-4" />
                  {salaryText}
                </span>
                {job.views_count !== undefined && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-400">
                    <Eye className="h-3.5 w-3.5" /> {job.views_count} {t("views")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-8 border-t border-slate-100 pt-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-950">{t("About the role")}</h2>
                <div className="mt-4 text-slate-600 leading-8 whitespace-pre-line">{job.description}</div>
              </section>

              {job.requirements && (
                <section>
                  <h2 className="text-xl font-bold text-slate-950">{t("Requirements & Qualifications")}</h2>
                  <div className="mt-4 text-slate-600 leading-8 whitespace-pre-line">{job.requirements}</div>
                </section>
              )}

              {job.responsibilities && (
                <section>
                  <h2 className="text-xl font-bold text-slate-950">{t("Key Responsibilities")}</h2>
                  <div className="mt-4 text-slate-600 leading-8 whitespace-pre-line">{job.responsibilities}</div>
                </section>
              )}
            </div>

            <aside className="h-fit rounded-2xl bg-[#f7f9ff] p-6 border border-blue-100/60">
              <p className="text-sm font-semibold text-slate-500">{t("Interested in this role?")}</p>

              {isAuthenticated ? (
                user?.role === "company" ? (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 font-medium">
                    You are logged in with an Employer account. Sign in as an applicant to apply.
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsApplyOpen(true)}
                    className="mt-4 h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-semibold"
                  >
                    {t("Apply for this position")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )
              ) : (
                <Button asChild className="mt-4 h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 font-semibold">
                  <Link to="/login">{t("Sign in to Apply")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              )}

              {job.deadline && (
                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> {t("Deadline:")} {job.deadline}
                </p>
              )}
            </aside>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {isApplyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">{t("Apply for Position")}</h3>
                <p className="text-xs text-slate-500 mt-1">{job.title} · {job.company_name}</p>
              </div>
              <button onClick={() => setIsApplyOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                ✕
              </button>
            </div>

            {applySuccess ? (
              <div className="py-10 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
                <h4 className="mt-4 text-xl font-bold text-slate-950">{t("Application Submitted!")}</h4>
                <p className="mt-2 text-sm text-slate-600">
                  Your application has been received by {job.company_name}. We've sent you a confirmation email.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApply} className="mt-6 space-y-4">
                {applyError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{t("Resume / Portfolio URL")}</label>
                  <input
                    type="url"
                    required
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/you or Google Drive / PDF link"
                    className="mt-1.5 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">{t("Cover Letter (Optional)")}</label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder={t("Share why you're a great fit for this role and what excites you...")}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)} className="rounded-xl">
                    {t("Cancel")}
                  </Button>
                  <Button type="submit" disabled={applyLoading} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    {applyLoading ? t("Submitting...") : t("Submit Application")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="job"
        targetId={job.id}
        targetTitle={job.title}
      />

      <SiteFooter />
    </div>
  );
}
