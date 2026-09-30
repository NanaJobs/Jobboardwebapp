import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  User as UserIcon,
  LogOut,
  Shield,
  Building2,
  DollarSign,
  Globe,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { jobsApi, searchApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { NotificationBell } from "@/components/NotificationCenter";

import CompanyLogo from "@/components/CompanyLogo";
import { formatSalary } from "@/lib/currency";

export type BackendJob = {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_email?: string;
  company_logo?: string;
  company?: {
    id: string;
    email: string;
    company_name: string;
    logo?: string;
  };
  category_name?: string;
  category_slug?: string;
  location: string;
  job_type: string;
  workplace_type: string;
  experience_level?: string;
  min_salary?: number;
  max_salary?: number;
  salary_currency?: string;
  is_featured?: boolean;
  views_count?: number;
  applications_count?: number;
  description?: string;
  created_at: string;
};

function timeAgo(dateString: string, locale?: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (locale === "am") {
    if (hours < 1) return "አሁን";
    if (hours < 24) return `${hours} ሰዓት በፊት`;
    const days = Math.floor(hours / 24);
    return `${days} ቀን በፊት`;
  }
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function JobCard({ job, onSave }: { job: BackendJob; onSave?: (id: string) => void }) {
  const { t, locale } = useLocale();
  const [saved, setSaved] = useState(false);
  const toggleSaved = () => {
    setSaved(!saved);
    onSave?.(job.id);
  };

  const logoSrc = job.company_logo || job.company?.logo;

  return (
    <article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.1)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <CompanyLogo src={logoSrc} name={job.company_name} size="md" />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold tracking-tight text-slate-950">{job.title}</h3>
              {job.is_featured && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  {t("Featured")}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500">{job.company_name}</p>
          </div>
        </div>
        <button
          aria-label={saved ? t("Remove saved job") : t("Save job")}
          title={saved ? t("Remove saved job") : t("Save job")}
          onClick={toggleSaved}
          className={`rounded-lg p-2 transition ${
            saved ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:bg-slate-50 hover:text-blue-600"
          }`}
        >
          <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500">
        {job.description || "Exciting role with competitive benefits and collaborative culture."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {job.location} ({t(job.workplace_type)})
        </span>
        <span className="rounded-full bg-slate-50 px-3 py-1.5 capitalize">{t(job.job_type.replace("_", " "))}</span>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 font-semibold">{formatSalary(job, locale)}</span>
        {job.category_name && (
          <span className="rounded-full bg-slate-50 px-3 py-1.5 text-slate-600">{t(job.category_name)}</span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="h-3.5 w-3.5" />
          {t("Posted")} {timeAgo(job.created_at, locale)}
        </span>
        <Link
          to={`/jobs/${job.slug || job.id}`}
          className="inline-flex items-center gap-1 font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100"
        >
          {t("View role")} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export default function Jobs() {
  const { t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [workplace, setWorkplace] = useState(searchParams.get("workplace") || "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") || "newest");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [jobsList, setJobsList] = useState<BackendJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [mobileFilters, setMobileFilters] = useState(false);

  // Load categories
  useEffect(() => {
    jobsApi.getCategories().then((res) => {
      if (res.results) setCategoriesList(res.results);
      else if (Array.isArray(res)) setCategoriesList(res);
    }).catch(console.error);
  }, []);

  // Fetch jobs on query/filter changes
  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {
      ordering,
    };
    if (query) params.q = query;
    if (category) params.category = category;
    if (workplace) params.workplace_type = workplace;

    searchApi.unified(params).then((res) => {
      if (res.results) {
        setJobsList(res.results);
      } else if (Array.isArray(res)) {
        setJobsList(res);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [query, category, workplace, ordering]);

  // Autocomplete
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.length >= 2) {
      searchApi.suggestions(val).then((res) => {
        if (res.data?.jobs) {
          setSuggestions(res.data.jobs);
          setShowSuggestions(true);
        }
      }).catch(() => {});
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            {t("Explore opportunities")}
          </p>
          <h1 className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            {t("Find work that feels like")} <span className="text-blue-600">you.</span>
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-500">
            {t("Search thousands of thoughtful teams hiring for their next great person.")}
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:flex-row relative">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-3.5 relative">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
              <Search className="h-4 w-4" />
            </div>
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              placeholder={t("Search by role, company, or keyword")}
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {query && (
              <button onClick={() => { setQuery(""); setShowSuggestions(false); }}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 top-14 z-30 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <p className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Suggested Roles</p>
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setQuery(s.title);
                      setShowSuggestions(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <span>{s.title}</span>
                    <span className="text-xs text-slate-400">{s.location}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2 px-2 md:flex">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">{t("All categories")}</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.slug || cat.id}>
                  {t(cat.name)}
                </option>
              ))}
            </select>

            <select
              value={workplace}
              onChange={(e) => setWorkplace(e.target.value)}
              className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">{t("All Workplaces")}</option>
              <option value="remote">{t("Remote")}</option>
              <option value="hybrid">{t("Hybrid")}</option>
              <option value="on_site">{t("On-site")}</option>
            </select>

            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="h-12 rounded-xl border-0 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="newest">{t("Newest")}</option>
              <option value="salary_high_to_low">{t("Highest salary")}</option>
              <option value="most_viewed">{t("Most viewed")}</option>
            </select>
          </div>

          <Button
            onClick={() => setMobileFilters(!mobileFilters)}
            className="h-12 rounded-xl bg-blue-600 px-6 shadow-lg shadow-blue-600/20 hover:bg-blue-700 md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> {t("Filters")}
          </Button>
        </div>

        {mobileFilters && (
          <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:hidden">
            <button
              onClick={() => { setCategory(""); setMobileFilters(false); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${category === "" ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
            >
              {t("All roles")}
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.slug || cat.id); setMobileFilters(false); }}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${category === (cat.slug || cat.id) ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}
              >
                {t(cat.name)}
              </button>
            ))}
          </div>
        )}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            <span className="font-bold text-slate-900">{jobsList.length}</span> {t("roles found")}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {jobsList.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {!loading && jobsList.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{t("No roles match that search")}</h2>
            <p className="mt-2 text-sm text-slate-500">{t("Try a different keyword or browse all categories.")}</p>
            <button
              onClick={() => { setQuery(""); setCategory(""); setWorkplace(""); }}
              className="mt-5 text-sm font-bold text-blue-600"
            >
              {t("Clear filters")}
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

export function SiteHeader() {
  const { locale, setLocale, t } = useLocale();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "company") return "/company/dashboard";
    if (user.role === "admin" || user.role === "super_admin") return "/admin/dashboard";
    return "/applicant/dashboard";
  };

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold tracking-[-0.04em] text-slate-950">
            Nana jobs<span className="text-blue-600">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {user?.role === "applicant" ? (
            <>
              <Link to="/jobs" className="hover:text-blue-600 font-semibold text-slate-950">
                {t("Find jobs")}
              </Link>
              <Link to="/applicant/applications" className="hover:text-blue-600">
                {t("My Applications")}
              </Link>
              <Link to="/applicant/profile" className="hover:text-blue-600">
                {t("My Profile & Resume")}
              </Link>
              <Link to="/marketplace" className="hover:text-blue-600">
                {t("Marketplace")}
              </Link>
            </>
          ) : user?.role === "company" ? (
            <>
              <Link to="/company/dashboard" className="hover:text-blue-600 font-semibold text-slate-950">
                {t("Dashboard")}
              </Link>
              <Link to="/company/applications" className="hover:text-blue-600">
                {t("Candidate Pipeline")}
              </Link>
              <Link to="/company/candidates" className="hover:text-blue-600">
                {t("Find Candidates")}
              </Link>
              <Link to="/company/jobs" className="hover:text-blue-600">
                {t("My Job Postings")}
              </Link>
              <Link to="/company/jobs/create" className="hover:text-blue-600">
                {t("Post a Job")}
              </Link>
              <Link to="/marketplace" className="hover:text-blue-600">
                {t("Marketplace")}
              </Link>
              <Link to="/company/profile" className="hover:text-blue-600">
                {t("Company Branding")}
              </Link>
            </>
          ) : (user?.role === "admin" || user?.role === "super_admin") ? (
            <>
              <Link to="/admin/dashboard" className="hover:text-blue-600 font-semibold text-slate-950">
                {t("Platform Analytics")}
              </Link>
              <Link to="/admin/users" className="hover:text-blue-600">
                {t("User Management")}
              </Link>
              <Link to="/admin/jobs" className="hover:text-blue-600">
                {t("Job Moderation")}
              </Link>
              <Link to="/admin/categories" className="hover:text-blue-600">
                {t("Categories")}
              </Link>
              <Link to="/marketplace" className="hover:text-blue-600">
                {t("Marketplace")}
              </Link>
            </>
          ) : (
            <>
              <Link to="/jobs" className="text-slate-950 hover:text-blue-600 font-semibold">
                {t("Find jobs")}
              </Link>
              <Link to="/login" className="hover:text-slate-950">
                {t("For companies")}
              </Link>
              <Link to="/marketplace" className="hover:text-slate-950">
                {t("Marketplace")}
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Prominent Language Switcher */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/90 p-0.5 text-xs font-bold shadow-xs">
            <Globe className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-0.5 hidden sm:block" />
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                locale === "en"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Switch to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("am")}
              className={`rounded-lg px-2.5 py-1 text-xs transition ${
                locale === "am"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="ወደ አማርኛ ቀይር"
            >
              አማርኛ
            </button>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-100"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                  {user.first_name ? user.first_name[0].toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline">{user.first_name || user.username}</span>
                <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 capitalize">
                  {user.role}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                title={t("Sign out")}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="hidden text-sm font-semibold text-slate-600 hover:text-slate-950 sm:block"
              >
                {t("Sign in")}
              </Link>
              <Button asChild className="h-10 rounded-xl bg-blue-600 px-4 text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700">
                <Link to="/register">
                  {t("Get started")} <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white p-5 md:hidden space-y-4 shadow-lg">
          <nav className="flex flex-col gap-3 text-sm font-medium text-slate-700">
            {user?.role === "applicant" ? (
              <>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 font-semibold">
                  {t("Find jobs")}
                </Link>
                <Link to="/applicant/applications" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("My Applications")}
                </Link>
                <Link to="/applicant/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("My Profile & Resume")}
                </Link>
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Marketplace")}
                </Link>
              </>
            ) : user?.role === "company" ? (
              <>
                <Link to="/company/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 font-semibold">
                  {t("Dashboard")}
                </Link>
                <Link to="/company/applications" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Candidate Pipeline")}
                </Link>
                <Link to="/company/candidates" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Find Candidates")}
                </Link>
                <Link to="/company/jobs" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("My Job Postings")}
                </Link>
                <Link to="/company/jobs/create" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Post a Job")}
                </Link>
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Marketplace")}
                </Link>
                <Link to="/company/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Company Branding")}
                </Link>
              </>
            ) : (user?.role === "admin" || user?.role === "super_admin") ? (
              <>
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 font-semibold">
                  {t("Platform Analytics")}
                </Link>
                <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("User Management")}
                </Link>
                <Link to="/admin/jobs" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Job Moderation")}
                </Link>
                <Link to="/admin/categories" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Categories")}
                </Link>
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Marketplace")}
                </Link>
              </>
            ) : (
              <>
                <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 font-semibold">
                  {t("Find jobs")}
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("For companies")}
                </Link>
                <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1">
                  {t("Marketplace")}
                </Link>
                {!isAuthenticated && (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 py-1 font-semibold">
                    {t("Sign in")}
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLocale();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© 2026 Nana jobs. {t("Better work, together.")}</p>
        <div className="flex gap-5">
          <Link to="/about" className="hover:text-slate-700">
            {t("About")}
          </Link>
          <Link to="/contact" className="hover:text-slate-700">
            {t("Contact")}
          </Link>
          <Link to="/" className="hover:text-slate-700">
            {t("Privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
