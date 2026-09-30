import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Code2,
  MapPin,
  Search,
  Sparkles,
  UsersRound,
  WandSparkles,
  Palette,
  Megaphone,
  HeartHandshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { JobCard, SiteFooter, SiteHeader, BackendJob } from "./Jobs";
import { useLocale } from "@/lib/i18n";
import { jobsApi, searchApi } from "@/lib/api";

const categoryIcons: Record<string, any> = {
  "Technology & IT": Code2,
  "Design & Creative": Palette,
  "Marketing & Communications": Megaphone,
  "Customer Support": HeartHandshake,
};

export default function Index() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [featuredJobs, setFeaturedJobs] = useState<BackendJob[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load trending & categories
    Promise.all([
      jobsApi.list({ is_featured: "true" }).catch(() => ({ results: [] })),
      jobsApi.getCategories().catch(() => ({ results: [] })),
    ]).then(([jobsRes, catsRes]) => {
      if (jobsRes.results) setFeaturedJobs(jobsRes.results.slice(0, 6));
      else if (Array.isArray(jobsRes)) setFeaturedJobs(jobsRes.slice(0, 6));

      if (catsRes.results) setCategories(catsRes.results.slice(0, 4));
      else if (Array.isArray(catsRes)) setCategories(catsRes.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    navigate(query.trim() ? `/jobs?search=${encodeURIComponent(query.trim())}` : "/jobs");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <SiteHeader />
      <main>
        {/* Hero Section */}
        <section className="relative bg-[#f7f9ff] px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pb-28">
          <div className="pointer-events-none absolute -right-32 -top-36 h-[520px] w-[520px] rounded-full bg-blue-100/60 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-100/30 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /> {t("Live Job Discovery & Hiring Pipeline Platform")}
              </div>

              <h1 className="max-w-2xl text-5xl font-bold leading-[1.04] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[72px]">
                {t("Work that makes you feel")}{" "}
                <span className="relative whitespace-nowrap text-blue-600">
                  {t("at home.")}
                  <span className="absolute -bottom-1 left-0 h-2 w-full -rotate-2 rounded-full bg-blue-200/80" />
                </span>
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-500 sm:text-xl">
                {t("Discover thoughtful teams, meaningful work, and opportunities built around the way you want to live.")}
              </p>

              <div className="mt-9 max-w-2xl rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_45px_rgba(30,64,175,0.12)]">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder={t("Job title, skill, or company")}
                      className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="h-12 rounded-xl bg-blue-600 px-7 font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                  >
                    {t("Search jobs")} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                <span>{t("Popular:")}</span>
                {["Python", "Remote", "Django", "Engineering"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setQuery(item);
                      navigate(`/jobs?search=${encodeURIComponent(item)}`);
                    }}
                    className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm hover:text-blue-600"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] lg:ml-auto">
              <div className="relative aspect-[.9] overflow-hidden rounded-[2.5rem] bg-[#dbeafe] p-5 shadow-2xl shadow-blue-900/10 sm:p-7">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-300/60" />
                <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-indigo-300/50" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {t("Verified Platform")}
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-blue-600">
                      <WandSparkles className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="relative mx-auto w-full max-w-[330px] rotate-[-3deg] rounded-3xl border border-white/80 bg-white p-5 shadow-xl">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        TC
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">TechCorp Solutions</p>
                        <p className="text-xs text-slate-400">{t("Verified Employer")}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Senior Python Backend Engineer</p>
                    <div className="mt-3 flex gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">{t("Remote")}</span>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">100k – 130k ETB</span>
                    </div>
                    <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{t("100% Verified")}</span>
                      <span className="text-[10px] font-bold text-blue-600">{t("View Listing")} →</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4 backdrop-blur">
                    <span className="text-xs font-semibold text-slate-700">{t("Join thousands building better careers")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{t("Browse by discipline")}</p>
              <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {t("Explore Industry Categories")}
              </h2>
            </div>
            <Link to="/jobs" className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex">
              {t("View all roles")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.name] || BriefcaseBusiness;
              return (
                <Link
                  to={`/jobs?category=${cat.slug || cat.id}`}
                  key={cat.id}
                  className="group rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-900/5 bg-white"
                >
                  <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="font-semibold text-slate-950 text-base">{t(cat.name)}</h3>
                  <p className="mt-1 text-xs text-slate-400">{cat.description || t("Discover open positions")}</p>
                  <ArrowRight className="mt-4 h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Jobs Section */}
        <section className="bg-[#f8fafc] px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">{t("Handpicked for you")}</p>
                <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  {t("Featured Job Opportunities")}
                </h2>
              </div>
              <Link to="/jobs" className="hidden items-center gap-1 text-sm font-bold text-blue-600 sm:flex">
                {t("Explore all jobs")} <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
                ))}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {featuredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Employer CTA */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
          <div className="relative overflow-hidden rounded-[2rem] bg-blue-600 px-7 py-12 text-white sm:px-12">
            <div className="relative max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-200">{t("For Employers")}</p>
              <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
                {t("Ready to hire top engineering & design talent?")}
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-blue-100">
                {t("Post your job listing, manage candidate pipelines, and review resumes with automated screening.")}
              </p>
              <Button asChild className="mt-8 rounded-xl bg-white px-5 font-semibold text-blue-700 hover:bg-blue-50">
                <Link to="/register">
                  {t("Start Hiring Today")} <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
