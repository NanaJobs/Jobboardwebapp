import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileText,
  Heart,
  LayoutDashboard,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  UsersRound,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  XCircle,
  Flag,
  ShieldAlert,
  Star,
  UserCheck,
  UserX,
  Ban,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "./Jobs";
import { useLocale } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { PasswordStrengthMeter, evaluatePassword } from "@/components/PasswordStrengthMeter";
import {
  dashboardApi,
  jobsApi,
  profilesApi,
  reportsApi,
  applicationsApi,
  adminApi,
  marketplaceApi,
  getMediaUrl
} from "@/lib/api";
import CompanyLogo from "@/components/CompanyLogo";
import UserAvatar from "@/components/UserAvatar";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

// -------------------------------------------------------------
// 1. Authentication Page (Sign In & Register)
// -------------------------------------------------------------
export function AuthPage({ register = false }: { register?: boolean }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { login, register: authRegister, isAuthenticated, user } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("applicant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated, redirect to role dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "company") navigate("/company/dashboard");
      else if (user.role === "admin" || user.role === "super_admin") navigate("/admin/dashboard");
      else navigate("/applicant/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (register) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        const { score } = evaluatePassword(password);
        if (score < 2) {
          throw new Error("Please choose a stronger password matching all security requirements.");
        }
        await authRegister({
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          confirm_password: confirmPassword,
          role,
        });
        setSuccessMsg("Account created successfully! We sent a verification email to your inbox. You can now sign in.");
      } else {
        const loggedUser = await login(email, password);
        if (loggedUser.role === "company") navigate("/company/dashboard");
        else if (loggedUser.role === "admin" || loggedUser.role === "super_admin") navigate("/admin/dashboard");
        else navigate("/applicant/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:py-20">
        <div className="hidden rounded-[2rem] bg-blue-600 p-10 text-white shadow-2xl shadow-blue-900/10 lg:block">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="mt-20 max-w-md text-4xl font-bold leading-tight tracking-[-.04em]">
            {register ? t("Start your career journey with top global companies.") : t("Welcome back to the modern job discovery platform.")}
          </h1>
          <p className="mt-5 max-w-md leading-7 text-blue-100">
            {t("Connect with verified employers, track your job applications in real time, and discover curated opportunities.")}
          </p>
          <div className="mt-16 flex items-center gap-3 text-sm text-blue-100">
            <CheckCircle2 className="h-5 w-5" /> {t("10,000+ engineers, designers, and teams already connected")}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-[.16em] text-blue-600">
              {register ? t("Create your account") : t("Welcome back")}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {register ? t("Join the network") : t("Sign in to your account")}
            </h2>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h3 className="mt-4 font-bold text-emerald-950">{t("Account Created!")}</h3>
              <p className="mt-2 text-xs text-emerald-800 leading-5">{successMsg}</p>
              <Button asChild className="mt-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 w-full">
                <Link to="/login">{t("Proceed to Sign In")} <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {register && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t("First Name")}
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`${inputClass} mt-1.5`}
                      placeholder="e.g. Alex"
                    />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t("Last Name")}
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`${inputClass} mt-1.5`}
                      placeholder="e.g. Smith"
                    />
                  </label>
                </div>
              )}

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

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t("Password")}
                  </label>
                  {!register && (
                    <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                      {t("Forgot password?")}
                    </Link>
                  )}
                </div>
                <div className="relative mt-1.5">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {register && <PasswordStrengthMeter password={password} />}
              </div>

              {register && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      {t("Confirm Password")}
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pr-11`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t("I am joining as:")}
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`${inputClass} mt-1.5`}
                    >
                      <option value="applicant">{t("Job Seeker / Applicant")}</option>
                      <option value="company">{t("Employer / Company")}</option>
                    </select>
                  </label>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 mt-2"
              >
                {loading ? t("Processing...") || "Processing..." : register ? t("Create account") : t("Sign in")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          <p className="mt-7 text-center text-xs text-slate-500">
            {register ? t("Already have an account?") : t("New to the platform?")}{" "}
            <Link to={register ? "/login" : "/register"} className="font-bold text-blue-600 hover:underline">
              {register ? t("Sign in") : t("Create an account")}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// Portal Layout Shell
// -------------------------------------------------------------
export function PortalLayout({
  role,
  title,
  subtitle,
  children,
}: {
  role: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { t } = useLocale();

  const applicantLinks = [
    { href: "/applicant/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/applicant/applications", label: "My Applications", icon: FileText },
    { href: "/applicant/profile", label: "My Profile & Resume", icon: UsersRound },
    { href: "/jobs", label: "Explore Jobs", icon: Search },
  ];

  const companyLinks = [
    { href: "/company/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/company/applications", label: "Candidate Pipeline", icon: UsersRound },
    { href: "/company/candidates", label: "Find Candidates", icon: UserCheck },
    { href: "/company/jobs", label: "My Job Postings", icon: BriefcaseBusiness },
    { href: "/company/jobs/create", label: "Post a New Job", icon: Plus },
    { href: "/marketplace", label: "Marketplace", icon: Compass },
    { href: "/company/profile", label: "Company Branding", icon: Building2 },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Platform Analytics", icon: BarChart3 },
    { href: "/admin/jobs", label: "Job Moderation", icon: ShieldCheck },
    { href: "/admin/companies", label: "Reports Console", icon: Flag },
  ];

  const links = role === "Applicant" ? applicantLinks : role === "Company" ? companyLinks : adminLinks;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_1fr] lg:px-10">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-4 lg:block h-fit">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 px-2 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
              {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-950 truncate">{user?.first_name ? `${user.first_name} ${user.last_name || ''}` : t(role)}</p>
              <p className="text-xs text-slate-400 capitalize">{t(role)} {t("Portal") || "Portal"}</p>
            </div>
          </div>

          <nav className="space-y-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Icon className="h-4 w-4" />
                {t(label)}
              </Link>
            ))}
          </nav>
        </aside>

        <main>
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[.16em] text-blue-600">{t(role)} {t("workspace")}</p>
            <h1 className="text-3xl font-bold tracking-[-.04em] text-slate-950 sm:text-4xl">{t(title)}</h1>
            <p className="mt-2 text-sm text-slate-500">{t(subtitle)}</p>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, tone = "blue" }: { label: string; value: string | number; icon: any; tone?: string }) {
  const { t } = useLocale();
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-purple-50 text-purple-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone] || tones.blue}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500 font-medium">{t(label)}</p>
    </div>
  );
}

// -------------------------------------------------------------
// 2. Applicant Dashboard (Phase 6 Integration)
// -------------------------------------------------------------
export function ApplicantDashboard() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getApplicantDashboard()
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const name = user?.first_name || "Job Seeker";

  return (
    <PortalLayout role="Applicant" title={`Welcome back, ${name}`} subtitle={t("Here is a live summary of your application pipeline.")}>
      {loading ? (
        <div className="py-20 text-center text-slate-400">{t("Loading...")}</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Applications" value={data?.overview?.total_applications || 0} icon={FileText} />
            <StatCard label="In Review / Pending" value={data?.overview?.pending_review || 0} icon={TrendingUp} tone="amber" />
            <StatCard label="Shortlisted & Interviews" value={(data?.overview?.shortlisted || 0) + (data?.overview?.interviewed || 0)} icon={UsersRound} tone="violet" />
            <StatCard label="Offers Received" value={data?.overview?.offered || 0} icon={CheckCircle2} tone="emerald" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            {/* Recent Applications */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-950">{t("Recent Applications")}</h2>
                <Link to="/applicant/applications" className="text-xs font-bold text-blue-600 hover:underline">
                  {t("View all →")}
                </Link>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {!data?.recent_applications || data.recent_applications.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">{t("Applications submitted for your job postings will appear here.")}</p>
                ) : (
                  data.recent_applications.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between gap-3 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{app.job_title}</p>
                        <p className="text-xs text-slate-500">
                          {app.company_name} · {t("Applied")} {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 capitalize">
                        {t(app.status_display || app.status || "Pending")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recommended Jobs */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-950">{t("Recommended for Your Skills")}</h2>
              <div className="mt-4 space-y-3">
                {!data?.recommended_jobs || data.recommended_jobs.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">{t("Update your profile skills to get matched jobs.") || "Update skills for matched jobs."}</p>
                ) : (
                  data.recommended_jobs.map((j: any) => (
                    <Link
                      key={j.id}
                      to={`/jobs/${j.slug || j.id}`}
                      className="block rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:border-blue-200 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-slate-900">{j.title}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{j.location} ({t(j.workplace_type)})</span>
                        <span className="font-bold text-blue-600">{t("View Details")} →</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </PortalLayout>
  );
}

// -------------------------------------------------------------
// 3. Company Dashboard (Phase 6 Integration)
// -------------------------------------------------------------
export function CompanyDashboard() {
  const { t } = useLocale();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getCompanyDashboard()
      .then((res) => {
        if (res.data) setData(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout role="Company" title={t("Employer Dashboard")} subtitle={t("Real-time candidate pipeline and hiring metrics.")}>
      {loading ? (
        <div className="py-20 text-center text-slate-400">{t("Loading...")}</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active Jobs" value={data?.overview?.active_jobs || 0} icon={BriefcaseBusiness} />
            <StatCard label="Total Candidates" value={data?.overview?.total_applications || 0} icon={UsersRound} tone="violet" />
            <StatCard label="Job Views" value={data?.overview?.total_job_views || 0} icon={BarChart3} tone="emerald" />
            <StatCard label="Shortlisted & Interviewing" value={(data?.pipeline?.shortlisted || 0) + (data?.pipeline?.interviewed || 0)} icon={TrendingUp} tone="amber" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
            {/* Top Performing Jobs */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="font-bold text-slate-950">{t("Active Job Listings")}</h2>
                <Button asChild size="sm" className="rounded-xl bg-blue-600">
                  <Link to="/company/jobs/create"><Plus className="h-4 w-4 mr-1" /> {t("Post Job")}</Link>
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="pb-3">{t("Role")}</th>
                      <th className="pb-3">{t("Views")}</th>
                      <th className="pb-3">{t("Applicants")}</th>
                      <th className="pb-3 text-right">{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!data?.top_jobs || data.top_jobs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-slate-400">{t("No active job listings yet.") || "No active jobs"}</td>
                      </tr>
                    ) : (
                      data.top_jobs.map((job: any) => (
                        <tr key={job.id}>
                          <td className="py-3.5 font-semibold text-slate-900">{job.title}</td>
                          <td className="py-3.5 text-slate-500">{job.views_count || 0}</td>
                          <td className="py-3.5 text-slate-500 font-bold">{job.applications_count || 0}</td>
                          <td className="py-3.5 text-right">
                            <Link to="/company/applications" className="text-xs font-bold text-blue-600 hover:underline">
                              {t("Review")}
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Candidate Pipeline Summary */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-bold text-slate-950">{t("Hiring Pipeline Funnel")}</h2>
              <div className="mt-4 space-y-2.5">
                {[
                  { label: "Pending Review", count: data?.pipeline?.pending || 0, color: "bg-amber-500" },
                  { label: "Shortlisted", count: data?.pipeline?.shortlisted || 0, color: "bg-blue-500" },
                  { label: "Interview Scheduled", count: data?.pipeline?.interviewed || 0, color: "bg-purple-500" },
                  { label: "Offer Extended", count: data?.pipeline?.offered || 0, color: "bg-indigo-500" },
                  { label: "Hired", count: data?.pipeline?.hired || 0, color: "bg-emerald-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="font-semibold text-slate-700">{t(item.label)}</span>
                    <span className="rounded-full bg-white px-2.5 py-1 font-bold text-slate-900 shadow-sm">{item.count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </PortalLayout>
  );
}

// -------------------------------------------------------------
// 4. Company Subpages (My Jobs, Create Job, Company Profile)
// -------------------------------------------------------------
export function CompanyPage({ type }: { type: "jobs" | "create" | "profile" }) {
  if (type === "create") return <JobCreate />;
  if (type === "profile") return <CompanyProfileView />;

  return <CompanyJobsList />;
}

function CompanyJobsList() {
  const { t } = useLocale();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = () => {
    setLoading(true);
    jobsApi.getMyJobs().then((res) => {
      if (res.results) setJobs(res.results);
      else if (res.data) setJobs(res.data);
      else if (Array.isArray(res)) setJobs(res);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await jobsApi.toggleStatus(id);
      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PortalLayout role="Company" title={t("My Job Postings")} subtitle={t("Manage your company listings, toggle active status, and review applicants.")}>
      <div className="mb-5 flex justify-end">
        <Button asChild className="rounded-xl bg-blue-600">
          <Link to="/company/jobs/create"><Plus className="h-4 w-4 mr-1" /> {t("Post a New Job")}</Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">{t("Loading...")}</div>
        ) : jobs.length === 0 ? (
          <div className="py-20 text-center">
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">{t("No active job listings yet.")}</p>
            <Button asChild className="mt-4 rounded-xl bg-blue-600" size="sm">
              <Link to="/company/jobs/create">{t("Post Job")}</Link>
            </Button>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="flex flex-col gap-4 border-b border-slate-100 p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-slate-950">{job.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {job.location} ({t(job.workplace_type)}) · {job.applications_count || 0} {t("Applicants")} · {job.views_count || 0} {t("Views")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${job.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                  {t(job.status)}
                </span>
                <Button variant="outline" size="sm" onClick={() => handleToggle(job.id)} className="rounded-lg text-xs">
                  {job.status === "published" ? t("Close") : t("Publish")}
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-lg text-xs">
                  <Link to={`/jobs/${job.slug || job.id}`}>{t("View Details")}</Link>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  );
}

function JobCreate() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [workplaceType, setWorkplaceType] = useState("remote");
  const [jobType, setJobType] = useState("full_time");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [location, setLocation] = useState("Remote / Worldwide");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fallbackCategories = [
    { id: "technology-it", name: "💻 Technology & IT" },
    { id: "software-engineering", name: "⚡ Software Engineering" },
    { id: "design-creative", name: "🎨 Design & Creative" },
    { id: "product-management", name: "🚀 Product Management" },
    { id: "sales-marketing", name: "📈 Sales & Marketing" },
    { id: "data-ai", name: "🤖 Data Science & AI" },
    { id: "finance-accounting", name: "💳 Finance & Accounting" },
    { id: "customer-support", name: "🎧 Customer Support" },
    { id: "general", name: "🌐 General / Operations" },
  ];

  useEffect(() => {
    jobsApi.getCategories().then((res) => {
      const list = res.data || res.results || (Array.isArray(res) ? res : []);
      if (list && list.length > 0) {
        setCategories(list);
        setCategoryId(list[0].id || list[0].name);
      } else {
        setCategories(fallbackCategories);
        setCategoryId(fallbackCategories[0].id);
      }
    }).catch(() => {
      setCategories(fallbackCategories);
      setCategoryId(fallbackCategories[0].id);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await jobsApi.create({
        title,
        category_id: categoryId || categories[0]?.id || "technology-it",
        category: categoryId || categories[0]?.id || "technology-it",
        workplace_type: workplaceType,
        job_type: jobType,
        experience_level: experienceLevel,
        location,
        description,
        requirements,
        salary_currency: "ETB",
        min_salary: minSalary ? Number(minSalary) : undefined,
        max_salary: maxSalary ? Number(maxSalary) : undefined,
        status: "published",
      });
      navigate("/company/jobs");
    } catch (err: any) {
      setError(err.message || "Failed to create job. Please verify your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLayout role="Company" title={t("Post a New Job")} subtitle={t("Publish your position to thousands of qualified candidates.")}>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
            {t("Role")} / {t("Title")}
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputClass} mt-1.5`}
              placeholder="e.g. Senior Python Backend Developer"
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t("Job Category")}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={`${inputClass} mt-1.5 cursor-pointer font-medium`}
            >
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.id || c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] font-normal text-slate-400">
              {t("Explore Industry Categories")}
            </span>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t("Workplace Type")}
            <select
              value={workplaceType}
              onChange={(e) => setWorkplaceType(e.target.value)}
              className={`${inputClass} mt-1.5 cursor-pointer`}
            >
              <option value="remote">{t("Remote")}</option>
              <option value="hybrid">{t("Hybrid")}</option>
              <option value="on_site">{t("On-site")}</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t("Job Type")}
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className={`${inputClass} mt-1.5 cursor-pointer`}
            >
              <option value="full_time">{t("Full-time")}</option>
              <option value="part_time">{t("Part-time")}</option>
              <option value="contract">{t("Contract")}</option>
              <option value="internship">{t("Internship")}</option>
            </select>
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t("Location")}
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`${inputClass} mt-1.5`}
              placeholder="e.g. Addis Ababa, Ethiopia or Remote"
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
            {t("Description")}
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this person build and accomplish?"
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
            {t("Requirements & Qualifications")}
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Key skills, tech stack, and qualifications needed..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t("Expected Salary")} (Min ETB)
            <input
              type="number"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              placeholder="45000"
              className={`${inputClass} mt-1.5`}
            />
          </label>

          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {t("Expected Salary")} (Max ETB)
            <input
              type="number"
              value={maxSalary}
              onChange={(e) => setMaxSalary(e.target.value)}
              placeholder="80000"
              className={`${inputClass} mt-1.5`}
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="button" variant="outline" onClick={() => navigate("/company/jobs")} className="rounded-xl">
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={loading} className="rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold">
            {loading ? t("Updating...") : t("Publish Job")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </PortalLayout>
  );
}

function CompanyProfileView() {
  const [profile, setProfile] = useState<any>(null);
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [website, setWebsite] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Company Logo Upload State
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoSuccess, setLogoSuccess] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    profilesApi.getCompanyProfile().then((res) => {
      if (res.data) {
        setProfile(res.data);
        setCompanyName(res.data.company_name || "");
        setTagline(res.data.tagline || "");
        setAbout(res.data.about || "");
        setWebsite(res.data.website || "");
        setHeadquarters(res.data.headquarters || "");
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setLogoError(null);
    setLogoSuccess(false);

    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await profilesApi.uploadCompanyLogo(formData);
      if (res.logo_url || res.data?.logo) {
        const newLogo = res.logo_url || res.data?.logo;
        setProfile((prev: any) => ({ ...prev, logo: newLogo }));
      } else {
        // Refresh profile data
        const updated = await profilesApi.getCompanyProfile();
        if (updated.data) setProfile(updated.data);
      }
      setLogoSuccess(true);
      setTimeout(() => setLogoSuccess(false), 4000);
    } catch (err: any) {
      setLogoError(err.message || "Failed to upload logo image.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profilesApi.updateCompanyProfile({
        company_name: companyName,
        tagline,
        about,
        website,
        headquarters,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const currentLogo = profile?.logo ? getMediaUrl(profile.logo) : null;

  return (
    <PortalLayout role="Company" title="Company Brand Profile" subtitle="Customize your public employer showcase and story.">
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading profile...</div>
      ) : (
        <div className="space-y-6">
          {/* Company Brand Logo Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Company Logo & Profile Image</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <CompanyLogo
                  src={currentLogo}
                  name={companyName}
                  size="xl"
                  className="h-24 w-24 rounded-3xl"
                />
                <label className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-slate-950/60 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 mb-1" />
                  <span className="text-[10px] font-bold">Change</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition">
                    <Upload className="h-4 w-4" />
                    {uploadingLogo ? "Uploading Logo..." : "Upload Company Logo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="sr-only"
                    />
                  </label>
                  {currentLogo && (
                    <span className="text-xs text-slate-500 font-medium">PNG, JPG, WebP, or SVG (Max 5MB)</span>
                  )}
                </div>

                {logoSuccess && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Company logo updated successfully!</span>
                  </div>
                )}
                {logoError && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{logoError}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Details Form */}
          <form onSubmit={handleSave} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            {savedMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Company profile updated successfully!</span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Company Name
                <input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`${inputClass} mt-1.5`}
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Website
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className={`${inputClass} mt-1.5`}
                  placeholder="https://yourcompany.com"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
                Tagline
                <input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className={`${inputClass} mt-1.5`}
                  placeholder="e.g. Building the next generation of cloud infrastructure."
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Headquarters Location
                <input
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className={`${inputClass} mt-1.5`}
                  placeholder="San Francisco, CA"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
                About Us / Company Story
                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
              <Button type="submit" disabled={saving} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                {saving ? "Saving Changes..." : "Save Company Profile"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </PortalLayout>
  );
}

// -------------------------------------------------------------
// 5. Super Admin Page (Analytics & Reports Moderation Console)
// -------------------------------------------------------------
export function AdminPage({ type }: { type: "dashboard" | "users" | "jobs" | "companies" }) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAdminData = () => {
    setLoading(true);
    if (type === "dashboard") {
      Promise.all([
        dashboardApi.getAdminDashboard(),
        reportsApi.getAdminReports({ status: "pending" })
      ])
        .then(([dashRes, reportsRes]) => {
          if (dashRes.data) setDashboardData(dashRes.data);
          if (reportsRes.results) setReportsList(reportsRes.results);
          else if (Array.isArray(reportsRes)) setReportsList(reportsRes);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (type === "users") {
      adminApi.getUsers({ q: searchQuery, role: roleFilter })
        .then((res) => {
          if (res.data) setUsersList(res.data);
          else if (res.results) setUsersList(res.results);
          else if (Array.isArray(res)) setUsersList(res);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (type === "jobs") {
      adminApi.getJobs({ q: searchQuery })
        .then((res) => {
          if (res.results) setJobsList(res.results);
          else if (Array.isArray(res)) setJobsList(res);
          else if (res.data) setJobsList(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else if (type === "companies") {
      marketplaceApi.getCompanies({ q: searchQuery })
        .then((res) => {
          if (res.results) setCompaniesList(res.results);
          else if (Array.isArray(res)) setCompaniesList(res);
          else if (res.data) setCompaniesList(res.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [type, searchQuery, roleFilter]);

  const handleToggleSuspendUser = async (userId: string, currentSuspended: boolean) => {
    const action = currentSuspended ? "activate" : "suspend";
    setActionLoading(userId);
    try {
      await adminApi.suspendUser(userId, action);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    setActionLoading(userId);
    try {
      await adminApi.deleteUser(userId);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatureJob = async (jobId: string) => {
    setActionLoading(jobId);
    try {
      await adminApi.toggleFeatureJob(jobId);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to toggle feature status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to permanently remove this job posting?")) return;
    setActionLoading(jobId);
    try {
      await adminApi.deleteJob(jobId);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to delete job");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId: string, action: string, status: string = "action_taken") => {
    try {
      await reportsApi.resolveAdminReport(reportId, {
        status,
        action_taken: action,
        admin_notes: `Resolved by admin with action: ${action}`,
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || "Failed to resolve report");
    }
  };

  return (
    <PortalLayout
      role="Admin"
      title={
        type === "dashboard"
          ? "Platform Health & Analytics"
          : type === "users"
          ? "User Accounts & Access Management"
          : type === "jobs"
          ? "Job Listings Moderation Console"
          : "Company Directory Oversight"
      }
      subtitle="Real-time supervision, violation investigation, and full platform administration."
    >
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading admin metrics & records...</div>
      ) : type === "dashboard" ? (
        /* DASHBOARD OVERVIEW */
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Registered Users" value={dashboardData?.user_metrics?.total_users || 0} icon={UsersRound} />
            <StatCard label="Live Jobs Posted" value={dashboardData?.job_metrics?.active_jobs || 0} icon={BriefcaseBusiness} tone="violet" />
            <StatCard label="Total Applications" value={dashboardData?.application_metrics?.total_applications || 0} icon={FileText} tone="emerald" />
            <StatCard label="Hiring Conversion Rate" value={`${dashboardData?.application_metrics?.hiring_conversion_rate_percentage || 0}%`} icon={TrendingUp} tone="amber" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-950">Recent Platform Registrations</h2>
                <Link to="/admin/users" className="text-xs font-bold text-blue-600 hover:underline">Manage All Users →</Link>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {dashboardData?.recent_activity?.recent_users?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">{u.role}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-950">Recent Job Postings</h2>
                <Link to="/admin/jobs" className="text-xs font-bold text-blue-600 hover:underline">Moderate Jobs →</Link>
              </div>
              <div className="mt-4 divide-y divide-slate-100">
                {dashboardData?.recent_activity?.recent_jobs?.map((j: any) => (
                  <div key={j.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{j.title}</p>
                      <p className="text-xs text-slate-500">{j.company__email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 capitalize">{j.status}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Pending Violation Reports */}
          {reportsList.length > 0 && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/40 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-red-950 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-600" /> Pending Violation Reports ({reportsList.length})
                </h3>
              </div>
              <div className="divide-y divide-red-100 bg-white rounded-xl border border-red-100 p-4">
                {reportsList.map((r: any) => (
                  <div key={r.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800 uppercase">{r.reason}</span>
                      <p className="mt-1 text-xs font-semibold text-slate-900">{r.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.target_type === "job" && (
                        <Button size="sm" onClick={() => handleResolveReport(r.id, "job_removed")} className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs">
                          Remove Job
                        </Button>
                      )}
                      {r.target_type === "user" && (
                        <Button size="sm" onClick={() => handleResolveReport(r.id, "user_suspended")} className="rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs">
                          Suspend User
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleResolveReport(r.id, "dismissed", "dismissed")} className="rounded-lg text-xs">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : type === "users" ? (
        /* USER ACCOUNTS MANAGEMENT */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none"
              >
                <option value="">All Roles</option>
                <option value="applicant">Job Seeker / Applicant</option>
                <option value="company">Employer / Company</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">No users found.</td>
                    </tr>
                  ) : (
                    usersList.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900">{u.first_name} {u.last_name}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${u.role === "company" ? "bg-purple-100 text-purple-800" : u.role === "super_admin" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.is_suspended ? (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800">Suspended</span>
                          ) : u.is_verified ? (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">Active</span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">Unverified</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== "super_admin" && (
                              <Button
                                size="sm"
                                variant={u.is_suspended ? "outline" : "ghost"}
                                disabled={actionLoading === u.id}
                                onClick={() => handleToggleSuspendUser(u.id, u.is_suspended)}
                                className={`rounded-lg text-xs ${u.is_suspended ? "border-emerald-500 text-emerald-700 hover:bg-emerald-50" : "text-amber-700 hover:bg-amber-50"}`}
                              >
                                {u.is_suspended ? "Activate" : "Suspend"}
                              </Button>
                            )}
                            {u.role !== "super_admin" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={actionLoading === u.id}
                                onClick={() => handleDeleteUser(u.id)}
                                className="rounded-lg text-xs text-red-600 hover:bg-red-50 p-2"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : type === "jobs" ? (
        /* JOB LISTINGS MODERATION */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search job listings by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <p className="text-xs font-bold text-slate-500">Total: {jobsList.length} Listings</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5">Job Title</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Workplace</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Featured</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">No job postings found.</td>
                    </tr>
                  ) : (
                    jobsList.map((j: any) => (
                      <tr key={j.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-950">{j.title}</div>
                          <div className="text-slate-500 text-[11px]">{j.company?.company_name || j.company_name || "Company"}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {j.category?.name || "General"}
                          </span>
                        </td>
                        <td className="px-5 py-4 capitalize text-slate-600">{j.workplace_type || "Remote"}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${j.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                            {j.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleFeatureJob(j.id)}
                            className={`rounded-lg text-xs flex items-center gap-1 ${j.is_featured ? "text-amber-600 font-bold bg-amber-50" : "text-slate-400"}`}
                          >
                            <Star className={`h-3.5 w-3.5 ${j.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                            {j.is_featured ? "Featured" : "Standard"}
                          </Button>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
                              <Link to={`/jobs/${j.slug || j.id}`}>View</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={actionLoading === j.id}
                              onClick={() => handleDeleteJob(j.id)}
                              className="rounded-lg text-xs text-red-600 hover:bg-red-50 p-2"
                              title="Delete job posting"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* COMPANIES DIRECTORY OVERSIGHT */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <p className="text-xs font-bold text-slate-500">Total: {companiesList.length} Companies</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {companiesList.map((c: any) => (
              <div key={c.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <CompanyLogo src={c.logo} name={c.company_name} size="md" />
                    {c.is_verified_badge && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Verified
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-bold text-slate-950">{c.company_name}</h3>
                  {c.headquarters && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.headquarters}</p>}
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{c.active_jobs_count || 0} Open Jobs</span>
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs">
                    <Link to={`/jobs?company=${c.id}`}>View Jobs →</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

// -------------------------------------------------------------
// 6. About & Contact Pages
// -------------------------------------------------------------
export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <section className="bg-[#f7f9ff] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">Our Mission</p>
            <h1 className="mt-4 text-5xl font-bold tracking-[-.05em] text-slate-950 sm:text-6xl">
              Connecting exceptional talent with <span className="text-blue-600">visionary teams.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500">
              Nana jobs is built from the ground up to make hiring transparent, fast, and respectful.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">We're here to help</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-.05em] text-slate-950">Let's talk.</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-slate-500">
            Have questions about posting jobs, integrations, or candidate screening? Get in touch with our support team.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
          {sent ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h2 className="mt-5 text-2xl font-bold text-slate-950">Message Sent</h2>
              <p className="mt-2 text-slate-500">We have received your message and will respond promptly.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Your Name
                <input required className={`${inputClass} mt-1.5`} placeholder="Name" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Email Address
                <input required type="email" className={`${inputClass} mt-1.5`} placeholder="you@example.com" />
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Message
                <textarea required rows={4} className="mt-1.5 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500" placeholder="How can we assist you?" />
              </label>
              <Button type="submit" className="h-12 w-full rounded-xl bg-blue-600 font-semibold shadow-lg shadow-blue-600/20">
                Send Message <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
