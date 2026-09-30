import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Code2,
  Link2,
  Globe,
  Sparkles,
  UsersRound,
  CheckCircle2,
  X,
  Building2,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { SiteHeader, SiteFooter } from "./Jobs";
import { marketplaceApi, profilesApi, getMediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import UserAvatar from "@/components/UserAvatar";

export default function TalentPage() {
  const { t, locale } = useLocale();
  const { user, isAuthenticated } = useAuth();
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [workplaceFilter, setWorkplaceFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  // Selected candidate profile modal
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTalents = () => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (searchQuery) params.q = searchQuery;
    if (jobTypeFilter) params.job_type = jobTypeFilter;
    if (workplaceFilter) params.workplace_type = workplaceFilter;
    if (locationFilter) params.location = locationFilter;

    marketplaceApi
      .getTalent(params)
      .then((res) => {
        if (res.results) setTalents(res.results);
        else if (Array.isArray(res)) setTalents(res);
        else if (res.data) setTalents(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTalents();
  }, [searchQuery, jobTypeFilter, workplaceFilter, locationFilter]);

  const handleOpenCandidate = async (talent: any) => {
    setSelectedCandidate(talent);
    setDetailLoading(true);
    try {
      const res = await marketplaceApi.getTalentDetail(talent.user_id || talent.id);
      if (res.data) {
        setSelectedCandidate(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 flex-1 w-full">
        {/* Header Hero */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl shadow-blue-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-md">
              <UsersRound className="h-3.5 w-3.5 text-blue-400" /> {t("Vetted Candidate Profiles & Resume Directory")}
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {t("Discover & Hire Top Verified Talent.")}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              {t("Explore candidate portfolios, career experience, education, verified skills, and resume documents. Reach out directly to fill your open positions.")}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative lg:col-span-2 flex items-center rounded-2xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search by candidate name, skill, title (e.g. React, Python)...")}
              className="h-12 w-full bg-transparent pl-3 pr-2 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
          >
            <option value="">{t("All Job Types")}</option>
            <option value="full_time">{t("Full-time")}</option>
            <option value="part_time">{t("Part-time")}</option>
            <option value="contract">{t("Contract / Freelance")}</option>
            <option value="internship">{t("Internship")}</option>
          </select>

          <select
            value={workplaceFilter}
            onChange={(e) => setWorkplaceFilter(e.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
          >
            <option value="">{t("All Workplaces")}</option>
            <option value="remote">{t("Remote Only")}</option>
            <option value="hybrid">{t("Hybrid")}</option>
            <option value="on_site">{t("On-site")}</option>
          </select>
        </div>

        {/* Candidate Count */}
        <div className="mt-8 mb-4 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {loading ? t("Searching candidates...") : `${talents.length} ${t("Verified Candidates Available")}`}
          </p>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="py-24 text-center text-xs text-slate-400">{t("Loading candidate talent profiles...")}</div>
        ) : talents.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
            <UsersRound className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-900">{t("No candidates found")}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t("Try adjusting your search criteria or keywords to find matching candidate profiles.")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {talents.map((c) => {
              const avatarUrl = c.avatar ? getMediaUrl(c.avatar) : null;
              const name = c.full_name || `${c.user?.first_name || ''} ${c.user?.last_name || ''}`.trim() || c.email;
              const initial = name ? name[0].toUpperCase() : "C";

              return (
                <div
                  key={c.id}
                  className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-xl hover:border-blue-200"
                >
                  <div>
                    {/* Candidate Header */}
                    <div className="flex items-start gap-4">
                      <UserAvatar
                        src={c.avatar}
                        name={name}
                        size="lg"
                        className="h-14 w-14 rounded-2xl border border-blue-50 text-lg"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-slate-950 text-base truncate group-hover:text-blue-600 transition">
                            {name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {c.headline || t("Job Candidate")}
                        </p>
                        {c.is_open_to_work && (
                          <span className="mt-1.5 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                            ● {t("Open to Work")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Location & Experience */}
                    <div className="mt-5 space-y-2 text-xs text-slate-600">
                      {c.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{c.location}</span>
                        </p>
                      )}
                      {c.latest_experience && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">
                            {c.latest_experience.position} at {c.latest_experience.company_name}
                          </span>
                        </p>
                      )}
                      {c.expected_salary && (
                        <p className="flex items-center gap-1.5 font-bold text-slate-900">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{t("Expected:")} {Number(c.expected_salary).toLocaleString()} {locale === "am" ? "ብር" : "ETB"}</span>
                        </p>
                      )}
                    </div>

                    {/* Skills Chips */}
                    {c.skills && c.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {c.skills.slice(0, 4).map((s: any) => (
                          <span
                            key={s.id || s.name}
                            className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                          >
                            {s.name}
                          </span>
                        ))}
                        {c.skills.length > 4 && (
                          <span className="rounded-lg bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-400">
                            +{c.skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Button
                      onClick={() => handleOpenCandidate(c)}
                      className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold py-5 shadow-sm"
                    >
                      {t("View Full Profile & CV →")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CANDIDATE FULL PROFILE MODAL */}
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              {/* Top Banner */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={selectedCandidate.avatar}
                    name={selectedCandidate.full_name || selectedCandidate.user?.first_name}
                    size="xl"
                    className="h-16 w-16 rounded-2xl border border-blue-100 text-2xl"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-950">
                        {selectedCandidate.full_name ||
                          `${selectedCandidate.user?.first_name || ''} ${selectedCandidate.user?.last_name || ''}`.trim() ||
                          selectedCandidate.email}
                      </h2>
                      {selectedCandidate.is_open_to_work && (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          {t("Open to Work")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {selectedCandidate.headline || t("Job Candidate")}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedCandidate.location || "Remote"} · {selectedCandidate.email || selectedCandidate.user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Contact & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {(selectedCandidate.email || selectedCandidate.user?.email) && (
                  <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold">
                    <a href={`mailto:${selectedCandidate.email || selectedCandidate.user?.email}`}>
                      <Mail className="h-3.5 w-3.5 mr-1.5" /> {t("Email Candidate")}
                    </a>
                  </Button>
                )}

                {selectedCandidate.phone_number && (
                  <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-200 text-xs font-bold">
                    <a href={`tel:${selectedCandidate.phone_number}`}>
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> {t("Call")} {selectedCandidate.phone_number}
                    </a>
                  </Button>
                )}

                {selectedCandidate.resume && (
                  <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-200 text-xs font-bold">
                    <a href={getMediaUrl(selectedCandidate.resume)} target="_blank" rel="noreferrer">
                      <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> {t("View Attached Resume (PDF)")} <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}

                {selectedCandidate.linkedin_url && (
                  <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                    <a href={selectedCandidate.linkedin_url} target="_blank" rel="noreferrer">
                      <Link2 className="h-3.5 w-3.5 mr-1 text-blue-600" /> LinkedIn
                    </a>
                  </Button>
                )}

                {selectedCandidate.github_url && (
                  <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                    <a href={selectedCandidate.github_url} target="_blank" rel="noreferrer">
                      <Code2 className="h-3.5 w-3.5 mr-1" /> GitHub
                    </a>
                  </Button>
                )}

                {selectedCandidate.portfolio_url && (
                  <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                    <a href={selectedCandidate.portfolio_url} target="_blank" rel="noreferrer">
                      <Globe className="h-3.5 w-3.5 mr-1 text-emerald-600" /> {t("Portfolio")}
                    </a>
                  </Button>
                )}
              </div>

              {/* Bio Summary */}
              {selectedCandidate.bio && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("About Candidate")}</h4>
                  <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
                    {selectedCandidate.bio}
                  </div>
                </div>
              )}

              {/* Verified Skills */}
              {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("Verified Skills")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((s: any) => (
                      <span
                        key={s.id || s.name}
                        className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 text-blue-600" /> {t("Work Experience")}
                </h4>
                {selectedCandidate.experiences && selectedCandidate.experiences.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidate.experiences.map((exp: any) => (
                      <div key={exp.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-slate-950 text-sm">{exp.position}</h5>
                            <p className="text-xs font-semibold text-blue-600 mt-0.5">{exp.company_name}</p>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">
                            {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">{t("No work experience listed.")}</p>
                )}
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-blue-600" /> {t("Education History")}
                </h4>
                {selectedCandidate.educations && selectedCandidate.educations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCandidate.educations.map((edu: any) => (
                      <div key={edu.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-bold text-slate-950 text-sm">
                              {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                            </h5>
                            <p className="text-xs font-semibold text-slate-600 mt-0.5">{edu.institution}</p>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500">
                            {edu.start_year} – {edu.end_year || "Present"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">{t("No education history listed.")}</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button variant="outline" onClick={() => setSelectedCandidate(null)} className="rounded-xl font-bold text-xs">
                  {t("Close Profile")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
