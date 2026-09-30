import React, { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  Search,
  UsersRound,
  ExternalLink,
  Star,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Globe,
  Code2,
  Link2,
  X,
  UserCheck,
  Eye,
  Download,
  Calendar,
  Building2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { PortalLayout } from "./PortalPages";
import { applicationsApi, getMediaUrl } from "@/lib/api";
import UserAvatar from "@/components/UserAvatar";

export default function CompanyApplications() {
  const { t } = useLocale();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  // Full Profile Modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Review form state
  const [newStatus, setNewStatus] = useState("reviewed");
  const [rating, setRating] = useState(3);
  const [companyNotes, setCompanyNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    applicationsApi
      .getCompanyApplications(statusFilter === "all" ? undefined : statusFilter)
      .then((res) => {
        const list = res.results || res.data || (Array.isArray(res) ? res : []);
        setApplications(list);
        if (list.length > 0 && !selectedApp) {
          setSelectedApp(list[0]);
          setNewStatus(list[0].status || "reviewed");
          setRating(list[0].rating || 3);
          setCompanyNotes(list[0].company_notes || "");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSelect = (app: any) => {
    setSelectedApp(app);
    setNewStatus(app.status || "reviewed");
    setRating(app.rating || 3);
    setCompanyNotes(app.company_notes || "");
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSaving(true);
    try {
      await applicationsApi.updateStatus(selectedApp.id, newStatus, rating, companyNotes);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200/60",
    reviewed: "bg-blue-50 text-blue-700 border-blue-200/60",
    shortlisted: "bg-purple-50 text-purple-700 border-purple-200/60",
    interviewed: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    offered: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    hired: "bg-emerald-100 text-emerald-800 border-emerald-300",
    rejected: "bg-rose-50 text-rose-700 border-rose-200/60",
    withdrawn: "bg-slate-100 text-slate-600 border-slate-200/60",
  };

  const filtered = applications.filter((app) => {
    const term = searchQuery.toLowerCase();
    const candidateName = `${app.applicant_name || app.applicant?.first_name || ''} ${app.applicant?.last_name || ''} ${app.applicant_email || app.applicant?.email || ''}`.toLowerCase();
    const jobTitle = `${app.job_title || app.job?.title || ''}`.toLowerCase();
    const headline = `${app.profile?.headline || ''}`.toLowerCase();
    return candidateName.includes(term) || jobTitle.includes(term) || headline.includes(term);
  });

  const candidateProfile = selectedApp?.profile || {};
  const candidateAvatar = candidateProfile?.avatar ? getMediaUrl(candidateProfile.avatar) : null;
  const candidateName = selectedApp
    ? (selectedApp.applicant_name || `${selectedApp.applicant?.first_name || ''} ${selectedApp.applicant?.last_name || ''}`.trim() || selectedApp.applicant_email || selectedApp.applicant?.email || "Candidate")
    : "";
  const candidateEmail = selectedApp?.applicant_email || selectedApp?.applicant?.email || candidateProfile?.user?.email;
  const candidatePhone = candidateProfile?.phone_number;
  
  // Profile resume (uploaded on profile)
  const profileResumeUrl = candidateProfile?.resume ? getMediaUrl(candidateProfile.resume) : null;
  
  // Application specific resume
  const appResumeFileUrl = selectedApp?.resume ? getMediaUrl(selectedApp.resume) : null;
  const appResumeLink = selectedApp?.resume_url;

  return (
    <PortalLayout role="Company" title={t("Candidate Review Pipeline")} subtitle={t("Review incoming applications, inspect candidate profiles & experience, and manage hiring stages.")}>
      {/* Search & Status Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row shadow-sm">
        <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full bg-transparent text-sm outline-none"
            placeholder={t("Search candidates by name, job title, skills...")}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none cursor-pointer"
        >
          <option value="all">{t("All Statuses")}</option>
          <option value="pending">{t("Pending")}</option>
          <option value="reviewed">{t("Reviewed")}</option>
          <option value="shortlisted">{t("Shortlisted")}</option>
          <option value="interviewed">{t("Interview Scheduled")}</option>
          <option value="offered">{t("Offer Extended")}</option>
          <option value="hired">{t("Hired")}</option>
          <option value="rejected">{t("Rejected")}</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_480px]">
        {/* Candidate Applications List */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 flex items-center justify-between">
            <h2 className="font-bold text-slate-950 text-base">{filtered.length} {t("Candidate Applications")}</h2>
            <span className="text-xs text-slate-400 font-medium">{t("Click candidate to review")}</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[800px] overflow-y-auto">
            {loading ? (
              <div className="py-24 text-center text-xs text-slate-400">{t("Loading candidates...")}</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <UsersRound className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">{t("No applicants found")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("Applications submitted for your job postings will appear here.")}</p>
              </div>
            ) : (
              filtered.map((app) => {
                const appProfile = app.profile;
                const avatar = appProfile?.avatar ? getMediaUrl(appProfile.avatar) : null;
                const name = app.applicant_name || `${app.applicant?.first_name || ''} ${app.applicant?.last_name || ''}`.trim() || app.applicant_email || app.applicant?.email || "Applicant";
                const initial = name ? name[0].toUpperCase() : "A";
                const isSelected = selectedApp?.id === app.id;

                return (
                  <button
                    key={app.id}
                    onClick={() => handleSelect(app)}
                    className={`w-full p-5 text-left transition hover:bg-blue-50/50 flex items-start gap-4 ${
                      isSelected ? "bg-blue-50/80 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <UserAvatar
                      src={appProfile?.avatar}
                      name={name}
                      size="md"
                      className="h-12 w-12 rounded-2xl border border-blue-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-950 text-sm truncate">{name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize border ${statusColors[app.status] || "bg-slate-100 text-slate-600"}`}>
                          {t(app.status_display || app.status)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-blue-600 font-semibold truncate">{app.job_title || app.job?.title}</p>
                      
                      {appProfile?.headline ? (
                        <p className="mt-1 text-xs text-slate-600 truncate">{appProfile.headline}</p>
                      ) : (
                        <p className="mt-1 text-xs text-slate-400 italic">{t("Candidate Profile")}</p>
                      )}

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>{t("Applied")} {new Date(app.applied_at).toLocaleDateString()}</span>
                        {appProfile?.location && <span>· 📍 {appProfile.location}</span>}
                        {appProfile?.experiences && appProfile.experiences.length > 0 && (
                          <span className="text-blue-700 font-medium">· 💼 {appProfile.experiences[0].position}</span>
                        )}
                        {appProfile?.is_open_to_work && (
                          <span className="text-emerald-700 font-bold">· ● {t("Open to Work")}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Candidate Detail & Full Profile Dossier */}
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm space-y-6 max-h-[850px] overflow-y-auto">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Candidate Top Header */}
              <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
                <UserAvatar
                  src={candidateProfile?.avatar}
                  name={candidateName}
                  size="xl"
                  className="h-16 w-16 rounded-2xl border border-blue-100 text-xl"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-950 text-base truncate">{candidateName}</h3>
                    {candidateProfile?.is_open_to_work && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {t("Open to Work")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {candidateProfile?.headline || t("Job Candidate")}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{candidateEmail}</p>
                  <p className="text-xs font-bold text-blue-600 mt-1">{t("Role")}: {selectedApp.job_title || selectedApp.job?.title}</p>
                </div>
              </div>

              {/* Quick Contact & Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setIsProfileModalOpen(true)}
                  size="sm"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold py-2 shadow-sm"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" /> {t("View Full Profile Modal")}
                </Button>

                {candidateEmail && (
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold border-slate-200">
                    <a href={`mailto:${candidateEmail}`}>
                      <Mail className="h-3.5 w-3.5 mr-1 text-blue-600" /> {t("Email")}
                    </a>
                  </Button>
                )}

                {candidatePhone ? (
                  <Button asChild size="sm" variant="outline" className="rounded-xl text-xs font-bold border-slate-200 text-emerald-700">
                    <a href={`tel:${candidatePhone}`}>
                      <Phone className="h-3.5 w-3.5 mr-1" /> {t("Call")}
                    </a>
                  </Button>
                ) : null}
              </div>

              {/* RESUME DOCUMENTS SECTION */}
              <div className="space-y-2 rounded-2xl bg-blue-50/50 p-4 border border-blue-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-blue-600" /> {t("Candidate Resume & CV")}
                </p>

                {profileResumeUrl && (
                  <a
                    href={profileResumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-bold text-blue-700 border border-blue-200/80 hover:bg-blue-50 transition shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" /> {t("Profile Resume (PDF)")}
                    </span>
                    <span className="flex items-center text-[11px] text-blue-600">
                      {t("View Document")} <ExternalLink className="h-3 w-3 ml-1" />
                    </span>
                  </a>
                )}

                {appResumeFileUrl && appResumeFileUrl !== profileResumeUrl && (
                  <a
                    href={appResumeFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-bold text-blue-700 border border-blue-200/80 hover:bg-blue-50 transition shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" /> {t("Job Application Resume File")}
                    </span>
                    <span className="flex items-center text-[11px] text-blue-600">
                      {t("View Document")} <ExternalLink className="h-3 w-3 ml-1" />
                    </span>
                  </a>
                )}

                {appResumeLink && !profileResumeUrl && !appResumeFileUrl && (
                  <a
                    href={appResumeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl bg-white p-3 text-xs font-bold text-blue-700 border border-blue-200/80 hover:bg-blue-50 transition shadow-sm"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Link2 className="h-4 w-4 text-blue-600 shrink-0" /> {t("Resume Link")}: {appResumeLink}
                    </span>
                    <ExternalLink className="h-3 w-3 ml-1 shrink-0" />
                  </a>
                )}

                {!profileResumeUrl && !appResumeFileUrl && !appResumeLink && (
                  <p className="text-xs text-slate-500 italic">No resume file attached.</p>
                )}
              </div>

              {/* WORK EXPERIENCE DOSSIER */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-600" /> {t("Work Experience")}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {candidateProfile?.experiences?.length || 0}
                  </span>
                </div>

                {candidateProfile?.experiences && candidateProfile.experiences.length > 0 ? (
                  <div className="space-y-3">
                    {candidateProfile.experiences.map((exp: any) => (
                      <div key={exp.id || exp.company_name} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-slate-950">{exp.position}</p>
                            <p className="text-xs font-semibold text-blue-600 mt-0.5">{exp.company_name}</p>
                          </div>
                          <span className="text-[10px] font-medium text-slate-500">
                            {exp.start_date} – {exp.is_current ? "Present" : (exp.end_date || "Present")}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100">
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

              {/* EDUCATION HISTORY */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-blue-600" /> {t("Education History")}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {candidateProfile?.educations?.length || 0}
                  </span>
                </div>

                {candidateProfile?.educations && candidateProfile.educations.length > 0 ? (
                  <div className="space-y-2">
                    {candidateProfile.educations.map((edu: any) => (
                      <div key={edu.id || edu.institution} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                        <p className="text-xs font-bold text-slate-950">
                          {edu.degree} {edu.field_of_study ? `in ${edu.field_of_study}` : ""}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                          <span>{edu.institution}</span>
                          <span className="text-[10px] text-slate-400">{edu.start_year} – {edu.end_year || "Present"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">{t("No education history listed.")}</p>
                )}
              </div>

              {/* SKILLS & SALARY & LOCATION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm text-xs">
                {candidateProfile?.skills && candidateProfile.skills.length > 0 && (
                  <div>
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] block mb-1.5">{t("Verified Skills")}:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {candidateProfile.skills.map((s: any) => (
                        <span key={s.id || s.name} className="rounded-lg bg-blue-50 border border-blue-200/60 px-2.5 py-1 text-xs font-semibold text-blue-800">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 text-[11px] block">{t("Location")}:</span>
                    <span className="font-semibold text-slate-800">{candidateProfile?.location || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">{t("Expected Salary")}:</span>
                    <span className="font-bold text-slate-900">
                      {candidateProfile?.expected_salary ? `${Number(candidateProfile.expected_salary).toLocaleString()} ETB` : "Negotiable"}
                    </span>
                  </div>
                </div>

                {candidateProfile?.bio && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px] block mb-1">{t("About Candidate")}:</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {candidateProfile.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* COVER LETTER */}
              {selectedApp.cover_letter && (
                <div className="rounded-2xl bg-amber-50/50 p-4 border border-amber-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">{t("Submitted Cover Letter")}</p>
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-white p-3 rounded-xl border border-amber-200/50">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              )}

              {/* HIRING STAGE & EVALUATION */}
              <form onSubmit={handleSaveReview} className="space-y-4 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">{t("Hiring Pipeline Stage & Evaluation")}</h4>

                {savedSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{t("Candidate status updated & notification sent!")}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{t("Update Status")}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="pending">{t("Pending Review")}</option>
                    <option value="reviewed">{t("Reviewed")}</option>
                    <option value="shortlisted">{t("Shortlisted")}</option>
                    <option value="interviewed">{t("Interview Scheduled")}</option>
                    <option value="offered">{t("Offer Extended")}</option>
                    <option value="hired">{t("Hired")}</option>
                    <option value="rejected">{t("Rejected")}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{t("Candidate Rating")}</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`p-1 rounded-lg transition ${rating >= star ? "text-amber-500" : "text-slate-200"}`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-500 ml-2">{rating} / 5</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">{t("Internal Notes")}</label>
                  <textarea
                    rows={3}
                    value={companyNotes}
                    onChange={(e) => setCompanyNotes(e.target.value)}
                    placeholder="Private feedback for your interviewers and hiring team..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-xs py-3">
                  {saving ? t("Updating...") : t("Save Hiring Review")}
                </Button>
              </form>
            </div>
          ) : (
            <div className="py-20 text-center">
              <UsersRound className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 font-bold text-slate-900 text-sm">{t("Select a Candidate")}</h3>
              <p className="mt-1 text-xs text-slate-500">{t("Choose an applicant from the list to view their complete dossier and update hiring stages.")}</p>
            </div>
          )}
        </aside>
      </div>

      {/* FULL CANDIDATE PROFILE MODAL */}
      {isProfileModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={candidateProfile?.avatar}
                  name={candidateName}
                  size="xl"
                  className="h-16 w-16 rounded-2xl border border-blue-100 text-2xl"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-950">{candidateName}</h2>
                    {candidateProfile?.is_open_to_work && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        Open to Work
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5">{candidateProfile?.headline || "Job Applicant"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {candidateProfile?.location || "Remote"} · {candidateEmail}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contact Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {candidateEmail && (
                <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold">
                  <a href={`mailto:${candidateEmail}`}>
                    <Mail className="h-3.5 w-3.5 mr-1.5" /> {t("Email Candidate")}
                  </a>
                </Button>
              )}

              {candidatePhone && (
                <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-200 text-xs font-bold">
                  <a href={`tel:${candidatePhone}`}>
                    <Phone className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> {t("Call")} {candidatePhone}
                  </a>
                </Button>
              )}

              {profileResumeUrl && (
                <Button asChild size="sm" variant="outline" className="rounded-xl border-slate-200 text-xs font-bold">
                  <a href={profileResumeUrl} target="_blank" rel="noreferrer">
                    <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" /> {t("View Profile Resume (PDF)") || t("View Attached Resume (PDF)")} <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}

              {candidateProfile?.linkedin_url && (
                <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                  <a href={candidateProfile.linkedin_url} target="_blank" rel="noreferrer">
                    <Link2 className="h-3.5 w-3.5 mr-1 text-blue-600" /> LinkedIn
                  </a>
                </Button>
              )}

              {candidateProfile?.github_url && (
                <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                  <a href={candidateProfile.github_url} target="_blank" rel="noreferrer">
                    <Code2 className="h-3.5 w-3.5 mr-1" /> GitHub
                  </a>
                </Button>
              )}

              {candidateProfile?.portfolio_url && (
                <Button asChild size="sm" variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                  <a href={candidateProfile.portfolio_url} target="_blank" rel="noreferrer">
                    <Globe className="h-3.5 w-3.5 mr-1 text-emerald-600" /> {t("Portfolio")}
                  </a>
                </Button>
              )}
            </div>

            {/* Candidate Bio */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("About Candidate")}</h4>
              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line border border-slate-100">
                {candidateProfile?.bio || t("No biography provided by applicant yet.")}
              </div>
            </div>

            {/* Verified Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{t("Verified Skills")}</h4>
              {candidateProfile?.skills && candidateProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidateProfile.skills.map((s: any) => (
                    <span
                      key={s.id || s.name}
                      className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">{t("No specific skills tagged on profile.")}</p>
              )}
            </div>

            {/* Work Experience */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-blue-600" /> {t("Work Experience")}
              </h4>
              {candidateProfile?.experiences && candidateProfile.experiences.length > 0 ? (
                <div className="space-y-3">
                  {candidateProfile.experiences.map((exp: any) => (
                    <div key={exp.id || exp.company_name} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-bold text-slate-950 text-sm">{exp.position}</h5>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">{exp.company_name}</p>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {exp.start_date} – {exp.is_current ? "Present" : (exp.end_date || "Present")}
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

            {/* Education History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600" /> {t("Education History")}
              </h4>
              {candidateProfile?.educations && candidateProfile.educations.length > 0 ? (
                <div className="space-y-3">
                  {candidateProfile.educations.map((edu: any) => (
                    <div key={edu.id || edu.institution} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
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
              <Button variant="outline" onClick={() => setIsProfileModalOpen(false)} className="rounded-xl font-bold text-xs">
                {t("Close Profile")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
