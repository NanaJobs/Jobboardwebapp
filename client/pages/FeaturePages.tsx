import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Send,
  Upload,
  UserRound,
  Briefcase,
  GraduationCap,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Building2,
  UsersRound,
  Globe,
  Code2,
  Clock,
  ShieldCheck,
  Sparkles,
  Search,
  Flame,
  Star,
  Tag,
  Filter,
  Trash2,
  FileText,
  ShoppingBag,
  Eye,
  Package,
  Layers,
  Phone,
  PhoneCall,
  MessageSquare,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { PortalLayout } from "./PortalPages";
import { SiteFooter, SiteHeader } from "./Jobs";
import { applicationsApi, profilesApi, marketplaceApi, getMediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import UserAvatar from "@/components/UserAvatar";
import CompanyLogo from "@/components/CompanyLogo";
import ProductCover from "@/components/ProductCover";

const fieldClass =
  "mt-1.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

// -------------------------------------------------------------
// 1. Applicant Applications Tracker Page (Phase 3 Integration)
// -------------------------------------------------------------
export function ApplicationsPage() {
  const { t } = useLocale();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchApplications = () => {
    setLoading(true);
    applicationsApi
      .getMyApplications()
      .then((res) => {
        if (res.results) setApplications(res.results);
        else if (Array.isArray(res)) setApplications(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (id: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await applicationsApi.withdraw(id);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    reviewed: "bg-blue-50 text-blue-700",
    shortlisted: "bg-purple-50 text-purple-700",
    interviewed: "bg-indigo-50 text-indigo-700",
    offered: "bg-emerald-50 text-emerald-700",
    hired: "bg-emerald-100 text-emerald-800",
    rejected: "bg-rose-50 text-rose-700",
    withdrawn: "bg-slate-100 text-slate-600",
  };

  const filtered = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  return (
    <PortalLayout role="Applicant" title={t("My Applications")} subtitle={t("Track your submissions, interview invitations, and status updates.")}>
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "pending", "shortlisted", "interviewed", "offered", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition ${
              filter === st ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {st === "all" ? "All Applications" : st.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading your applications...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm font-semibold text-slate-900">No applications found in this view.</p>
            <Button asChild className="mt-4 rounded-xl bg-blue-600" size="sm">
              <Link to="/jobs">Browse Open Positions</Link>
            </Button>
          </div>
        ) : (
          filtered.map((app) => (
            <div key={app.id} className="border-b border-slate-100 p-5 last:border-0 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold text-slate-950 text-base">{app.job_title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{app.company_name} · {app.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColors[app.status] || "bg-slate-100 text-slate-600"}`}>
                    {app.status_display || app.status}
                  </span>
                  {app.status !== "withdrawn" && app.status !== "hired" && app.status !== "rejected" && (
                    <button
                      onClick={() => handleWithdraw(app.id)}
                      className="text-xs font-medium text-slate-400 hover:text-red-600 transition"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 gap-2">
                <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                {app.resume_url && (
                  <a
                    href={app.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    View Submitted Resume <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PortalLayout>
  );
}

export function SavedJobsPage() {
  const { t } = useLocale();
  return (
    <PortalLayout role="Applicant" title={t("Saved jobs")} subtitle={t("Roles you’re keeping an eye on.")}>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <Bookmark className="mx-auto h-10 w-10 text-slate-300" />
        <h2 className="mt-4 text-lg font-bold text-slate-950">{t("No saved jobs yet")}</h2>
        <p className="mt-2 text-sm text-slate-500">{t("Save roles you love and they’ll appear here.")}</p>
        <Button asChild className="mt-5 rounded-xl bg-blue-600">
          <Link to="/jobs">{t("Explore jobs")}</Link>
        </Button>
      </div>
    </PortalLayout>
  );
}

// -------------------------------------------------------------
// 2. Applicant Profile & Resume Page (Phase 4 Integration)
// -------------------------------------------------------------
export function ProfilePage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [openToWork, setOpenToWork] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  // Experience Modal
  const [experiences, setExperiences] = useState<any[]>([]);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [expCompany, setExpCompany] = useState("");
  const [expPos, setExpPos] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expDesc, setExpDesc] = useState("");

  // Education Modal
  const [educations, setEducations] = useState<any[]>([]);
  const [isEduModalOpen, setIsEduModalOpen] = useState(false);
  const [eduInst, setEduInst] = useState("");
  const [eduDeg, setEduDeg] = useState("");
  const [eduField, setEduField] = useState("");
  const [eduStart, setEduStart] = useState("");
  const [eduEnd, setEduEnd] = useState("");

  const fetchProfile = () => {
    setLoading(true);
    profilesApi
      .getApplicantProfile()
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setHeadline(res.data.headline || "");
          setLocation(res.data.location || "");
          setBio(res.data.bio || "");
          setExpectedSalary(res.data.expected_salary ? String(res.data.expected_salary) : "");
          setOpenToWork(res.data.is_open_to_work ?? true);
          setExperiences(res.data.experiences || []);
          setEducations(res.data.educations || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      await profilesApi.uploadApplicantAvatar(formData);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to upload avatar photo");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      await profilesApi.uploadApplicantResume(formData);
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to upload resume file");
    } finally {
      setResumeUploading(false);
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await profilesApi.updateApplicantProfile({
        headline,
        location,
        bio,
        expected_salary: expectedSalary ? Number(expectedSalary) : undefined,
        is_open_to_work: openToWork,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddExperience = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await profilesApi.addExperience({
        company_name: expCompany,
        position: expPos,
        start_date: expStart,
        end_date: expEnd || undefined,
        is_current: !expEnd,
        description: expDesc,
      });
      setIsExpModalOpen(false);
      setExpCompany("");
      setExpPos("");
      setExpStart("");
      setExpEnd("");
      setExpDesc("");
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      await profilesApi.deleteExperience(id);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEducation = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await profilesApi.addEducation({
        institution: eduInst,
        degree: eduDeg,
        field_of_study: eduField,
        start_year: Number(eduStart),
        end_year: eduEnd ? Number(eduEnd) : undefined,
      });
      setIsEduModalOpen(false);
      setEduInst("");
      setEduDeg("");
      setEduField("");
      setEduStart("");
      setEduEnd("");
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    try {
      await profilesApi.deleteEducation(id);
      fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const initial = user?.first_name ? user.first_name[0].toUpperCase() : "U";

  return (
    <PortalLayout role="Applicant" title={t("Profile & Career Resume")} subtitle={t("Keep your skills, experience, and career profile updated for employers.")}>
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading your profile...</div>
      ) : (
        <div className="space-y-8">
          {/* Main Info Form */}
          <form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {savedMsg && (
              <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Profile saved successfully!</span>
              </div>
            )}

            <div className="flex flex-col gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-center">
              <div className="relative group">
                <UserAvatar
                  src={profile?.avatar}
                  name={`${user?.first_name || ''} ${user?.last_name || ''}`}
                  size="xl"
                  className="h-20 w-20 rounded-3xl border-2 border-white shadow-md text-2xl"
                />
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700">
                  <ImagePlus className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={avatarUploading}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-950">{user?.first_name} {user?.last_name}</h2>
                  {avatarUploading && <span className="text-xs text-blue-600 font-semibold animate-pulse">Uploading photo...</span>}
                </div>
                <p className="mt-1 text-sm text-slate-500">{headline || "Add your professional title"}</p>
                <div className="mt-3 flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={openToWork}
                      onChange={(e) => setOpenToWork(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Open to Work
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Professional Headline
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. Senior Backend Engineer (Python / AWS)"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Location
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={fieldClass}
                  placeholder="e.g. San Francisco, CA or Remote"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Expected Salary (ETB)
                <input
                  type="number"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  className={fieldClass}
                  placeholder="50000"
                />
              </label>

              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 sm:col-span-2">
                About You / Career Summary
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-blue-500"
                  placeholder="Tell employers about your technical background, projects, and career interests..."
                />
              </label>
            </div>

            <div className="mt-7 flex justify-end border-t border-slate-100 pt-6">
              <Button type="submit" disabled={saving} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                {saving ? "Saving..." : "Save Profile Details"}
              </Button>
            </div>
          </form>

          {/* Resume & CV Document Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-950 text-lg">Resume & CV Document</h3>
              </div>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 shadow-sm">
                <Upload className="h-4 w-4" />
                <span>{resumeUploading ? "Uploading..." : profile?.resume ? "Replace Resume" : "Upload Resume (PDF)"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  disabled={resumeUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="mt-4">
              {profile?.resume ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-blue-50/70 border border-blue-100 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profile.resume.split("/").pop() || "Curriculum_Vitae_Resume.pdf"}
                      </p>
                      <p className="text-[11px] text-slate-500">Attached to your candidate profile for 1-click applications.</p>
                    </div>
                  </div>
                  <a
                    href={getMediaUrl(profile.resume)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View Document <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  <FileText className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-600">No resume document uploaded yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload a PDF or DOCX file to enable 1-click job applications.</p>
                </div>
              )}
            </div>
          </section>

          {/* Work Experience Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-950 text-lg">Work Experience</h3>
              </div>
              <Button size="sm" onClick={() => setIsExpModalOpen(true)} className="rounded-xl bg-blue-600">
                <Plus className="h-4 w-4 mr-1" /> Add Position
              </Button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {experiences.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No work experience added yet.</p>
              ) : (
                experiences.map((exp) => (
                  <div key={exp.id} className="py-4 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{exp.position}</p>
                      <p className="text-xs text-slate-500">{exp.company_name} · {exp.start_date} – {exp.is_current ? "Present" : exp.end_date}</p>
                      {exp.description && <p className="mt-2 text-xs text-slate-600">{exp.description}</p>}
                    </div>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Education Section */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-950 text-lg">Education</h3>
              </div>
              <Button size="sm" onClick={() => setIsEduModalOpen(true)} className="rounded-xl bg-blue-600">
                <Plus className="h-4 w-4 mr-1" /> Add Education
              </Button>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {educations.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">No education entries added yet.</p>
              ) : (
                educations.map((edu) => (
                  <div key={edu.id} className="py-4 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{edu.degree} in {edu.field_of_study}</p>
                      <p className="text-xs text-slate-500">{edu.institution} · {edu.start_year} – {edu.end_year || "Present"}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}

      {/* Add Experience Modal */}
      {isExpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddExperience} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Add Work Experience</h3>
            <label className="block text-xs font-bold uppercase text-slate-600">Company Name<input required value={expCompany} onChange={(e) => setExpCompany(e.target.value)} className={fieldClass} /></label>
            <label className="block text-xs font-bold uppercase text-slate-600">Position / Title<input required value={expPos} onChange={(e) => setExpPos(e.target.value)} className={fieldClass} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold uppercase text-slate-600">Start Date<input type="date" required value={expStart} onChange={(e) => setExpStart(e.target.value)} className={fieldClass} /></label>
              <label className="block text-xs font-bold uppercase text-slate-600">End Date<input type="date" value={expEnd} onChange={(e) => setExpEnd(e.target.value)} className={fieldClass} /></label>
            </div>
            <label className="block text-xs font-bold uppercase text-slate-600">Description<textarea rows={3} value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsExpModalOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-blue-600">Add Experience</Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Education Modal */}
      {isEduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <form onSubmit={handleAddEducation} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-950">Add Education</h3>
            <label className="block text-xs font-bold uppercase text-slate-600">Institution / University<input required value={eduInst} onChange={(e) => setEduInst(e.target.value)} className={fieldClass} /></label>
            <label className="block text-xs font-bold uppercase text-slate-600">Degree<input required value={eduDeg} onChange={(e) => setEduDeg(e.target.value)} placeholder="B.S. / M.S." className={fieldClass} /></label>
            <label className="block text-xs font-bold uppercase text-slate-600">Field of Study<input required value={eduField} onChange={(e) => setEduField(e.target.value)} placeholder="Computer Science" className={fieldClass} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold uppercase text-slate-600">Start Year<input type="number" required value={eduStart} onChange={(e) => setEduStart(e.target.value)} placeholder="2018" className={fieldClass} /></label>
              <label className="block text-xs font-bold uppercase text-slate-600">End Year<input type="number" value={eduEnd} onChange={(e) => setEduEnd(e.target.value)} placeholder="2022" className={fieldClass} /></label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEduModalOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl bg-blue-600">Add Education</Button>
            </div>
          </form>
        </div>
      )}
    </PortalLayout>
  );
}

export function CompanyOverviewPage() {
  const { t } = useLocale();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    marketplaceApi.getCompanies({ q: search })
      .then((res) => {
        if (res.results) setCompanies(res.results);
        else if (Array.isArray(res)) setCompanies(res);
        else if (res.data) setCompanies(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-700">
            🏢 {t("Verified Employers")}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            {t("Top Companies Hiring Now")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t("Explore industry leaders, startups, and tech giants actively building their teams.")}
          </p>

          <div className="mt-6 relative max-w-md mx-auto flex items-center rounded-2xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder={t("Search companies by name or industry...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full bg-transparent pl-3 pr-2 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">{t("Loading...")}</div>
        ) : companies.length === 0 ? (
          <div className="py-20 text-center text-slate-500">{t("No applicants found")}</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <div
                key={c.id}
                className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-xl hover:border-blue-200"
              >
                <div className="flex items-start justify-between">
                  <CompanyLogo src={c.logo} name={c.company_name} size="lg" />
                  {c.is_verified_badge && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> {t("Verified")}
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-950 group-hover:text-blue-600 transition">
                  {c.company_name}
                </h3>
                {c.tagline && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.tagline}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {c.headquarters && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {c.headquarters}
                    </span>
                  )}
                  {c.industry?.name && (
                    <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                      {c.industry.name}
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {c.active_jobs_count || 0} {t("Open Positions")}
                  </span>
                  <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs">
                    <Link to={`/jobs?company=${c.id}`}>{t("View Openings →")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

// -------------------------------------------------------------
// 4. Ecommerce Product & Digital Assets Marketplace
// -------------------------------------------------------------
export function MarketplacePage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLocale();
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("-created_at");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "my_products">("all");

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Inquiry Form
  const [inquiryName, setInquiryName] = useState(user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : "");
  const [inquiryEmail, setInquiryEmail] = useState(user?.email || "");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Create Product Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postCategory, setPostCategory] = useState("Software & SaaS");
  const [postPrice, setPostPrice] = useState("");
  const [postCurrency, setPostCurrency] = useState("ETB");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postShortDesc, setPostShortDesc] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postContactEmail, setPostContactEmail] = useState(user?.email || "");
  const [postContactPhone, setPostContactPhone] = useState("");
  const [postCoverFile, setPostCoverFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const categories = [
    { id: "all", label: t("All Items") },
    { id: "Software & SaaS", label: `💻 ${t("Software & SaaS")}` },
    { id: "Templates & Themes", label: `🎨 ${t("Templates & Themes")}` },
    { id: "Developer Tools", label: `⚡ ${t("Developer Tools")}` },
    { id: "APIs & Data", label: `🔌 ${t("APIs & Data")}` },
    { id: "AI & Automation", label: `✨ ${t("AI & Automation")}` },
    { id: "Courses & E-books", label: `📚 ${t("Courses & E-books")}` },
    { id: "Freelance Services", label: `💼 ${t("Freelance Services")}` },
  ];

  const fetchProducts = () => {
    setLoading(true);
    if (viewMode === "my_products") {
      marketplaceApi.getMyProducts()
        .then((res) => {
          if (res.data) setProducts(res.data);
          else if (Array.isArray(res)) setProducts(res);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
      return;
    }

    const params: Record<string, any> = {
      q: searchQuery || undefined,
      category: activeCategory !== "all" ? activeCategory : undefined,
      sort: sortOrder,
    };

    if (priceFilter === "free") {
      params.max_price = 0;
    } else if (priceFilter === "under_1000") {
      params.max_price = 1000;
    } else if (priceFilter === "1000_5000") {
      params.min_price = 1000;
      params.max_price = 5000;
    } else if (priceFilter === "over_5000") {
      params.min_price = 5000;
    }

    marketplaceApi.getProducts(params)
      .then((res) => {
        if (res.results) setProducts(res.results);
        else if (Array.isArray(res)) setProducts(res);
        else if (res.data) setProducts(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, priceFilter, sortOrder, searchQuery, viewMode]);

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    setPosting(true);
    setPostError("");

    try {
      if (postCoverFile) {
        const formData = new FormData();
        formData.append("title", postTitle);
        formData.append("category", postCategory);
        formData.append("price", postPrice || "0");
        formData.append("currency", postCurrency);
        formData.append("image", postCoverFile);
        if (postImageUrl) formData.append("image_url", postImageUrl);
        formData.append("short_description", postShortDesc);
        formData.append("description", postDesc);
        if (postUrl) formData.append("product_url", postUrl);
        if (postContactEmail) formData.append("contact_email", postContactEmail);
        if (postContactPhone) formData.append("contact_phone", postContactPhone);

        await marketplaceApi.createProduct(formData);
      } else {
        await marketplaceApi.createProduct({
          title: postTitle,
          category: postCategory,
          price: Number(postPrice) || 0,
          currency: postCurrency,
          image_url: postImageUrl,
          short_description: postShortDesc,
          description: postDesc,
          product_url: postUrl,
          contact_email: postContactEmail,
          contact_phone: postContactPhone,
        });
      }

      setIsPostModalOpen(false);
      setPostTitle("");
      setPostPrice("");
      setPostShortDesc("");
      setPostDesc("");
      setPostUrl("");
      setPostCoverFile(null);
      fetchProducts();
    } catch (err: any) {
      setPostError(err.message || "Failed to list product. Please check your inputs.");
    } finally {
      setPosting(false);
    }
  };

  const handleSendInquiry = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setInquirySending(true);
    try {
      await marketplaceApi.inquireProduct(selectedProduct.id, {
        sender_name: inquiryName,
        sender_email: inquiryEmail,
        sender_phone: inquiryPhone,
        message: inquiryMsg,
      });
      setInquirySuccess(true);
      setInquiryMsg("");
      setTimeout(() => setInquirySuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to send inquiry to seller.");
    } finally {
      setInquirySending(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product listing?")) return;
    try {
      await marketplaceApi.deleteProduct(id);
      if (selectedProduct?.id === id) setSelectedProduct(null);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 flex-1 w-full">
        {/* Hero Section */}
        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl shadow-blue-950/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-md">
                <ShoppingBag className="h-3.5 w-3.5 text-blue-400" /> {t("Digital Tech & Asset Marketplace")}
              </span>
              <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                {t("Buy & Sell Developer Tools, UI Kits, SaaS, and Tech Assets.")}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                {t("A community-driven ecommerce marketplace where creators showcase code, designs, APIs, and digital products directly to buyers and engineering teams.")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              {isAuthenticated ? (
                <Button
                  onClick={() => setIsPostModalOpen(true)}
                  className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-6 shadow-xl shadow-blue-600/30 flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" /> {t("Post a Product / Sell")}
                </Button>
              ) : (
                <Button asChild className="rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 px-6 shadow-xl">
                  <Link to="/auth/login">{t("Login to Sell Products")}</Link>
                </Button>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => setViewMode(viewMode === "all" ? "my_products" : "all")}
                  className={`rounded-2xl border px-5 py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                    viewMode === "my_products"
                      ? "bg-white text-slate-900 border-white"
                      : "border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  {viewMode === "my_products" ? t("← View All Marketplace Items") : t("My Listed Products")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setViewMode("all");
              }}
              className={`rounded-2xl px-4 py-2.5 text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                activeCategory === cat.id && viewMode === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search, Price & Sort Toolbar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1 flex items-center rounded-2xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search products, software tools, UI kits, templates...")}
              className="h-12 w-full bg-transparent pl-3 pr-2 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Price Filter */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
            >
              <option value="all">{t("All Prices")}</option>
              <option value="free">{t("Free / Open Source")}</option>
              <option value="under_1000">{t("Under 1,000 ETB")}</option>
              <option value="1000_5000">{t("1,000 – 5,000 ETB")}</option>
              <option value="over_5000">{t("5,000+ ETB")}</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer"
            >
              <option value="-created_at">{t("Newest Listings")}</option>
              <option value="popular">{t("Most Popular")}</option>
              <option value="price_asc">{t("Price: Low to High")}</option>
              <option value="price_desc">{t("Price: High to Low")}</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {viewMode === "my_products" ? t("Your Listed Products") : `${t("Showing")} ${products.length} ${t("Products")}`}
            </p>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs text-slate-400">{t("Loading marketplace products...")}</div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-900">
                {viewMode === "my_products" ? t("You haven't listed any products yet") : t("No products found")}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {viewMode === "my_products"
                  ? t("Start selling your digital templates, dev tools, or software assets to our community.")
                  : t("Try clearing search filters or be the first to list a product in this category.")}
              </p>
              {isAuthenticated && (
                <Button onClick={() => setIsPostModalOpen(true)} className="mt-5 rounded-xl bg-blue-600">
                  <Plus className="h-4 w-4 mr-1.5" /> {t("Post Your First Product")}
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const cover = p.image ? getMediaUrl(p.image) : p.image_url;
                const isFree = Number(p.price) === 0;

                return (
                  <div
                    key={p.id}
                    className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-xl hover:border-blue-200 overflow-hidden"
                  >
                    <div>
                      {/* Product Image Cover */}
                      <div className="relative h-48 w-full rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50/50 overflow-hidden border border-slate-100 flex items-center justify-center">
                        <ProductCover
                          src={cover}
                          title={p.title}
                          category={p.category}
                          className="group-hover:scale-105"
                        />

                        {/* Price Tag Overlay */}
                        <div className="absolute top-3 right-3 rounded-full bg-slate-950/80 backdrop-blur-md px-3 py-1 text-xs font-black text-white shadow-lg">
                          {isFree ? t("Free") : `${Number(p.price).toLocaleString()} ${p.currency || 'ETB'}`}
                        </div>

                        {/* Category Pill */}
                        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-slate-800 shadow-sm">
                          {p.category}
                        </div>
                      </div>

                      {/* Title & Short Description */}
                      <h3
                        onClick={() => setSelectedProduct(p)}
                        className="mt-4 text-base font-bold text-slate-950 group-hover:text-blue-600 transition cursor-pointer line-clamp-1"
                      >
                        {p.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {p.short_description || p.description || t("Digital product available on Nana jobs Marketplace.")}
                      </p>

                      {/* Phone Badge if available */}
                      {p.contact_phone && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-xl w-fit">
                          <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono">{p.contact_phone}</span>
                        </div>
                      )}

                      {/* Seller Info */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar
                            src={p.seller_avatar}
                            name={p.seller_name}
                            size="sm"
                            className="h-7 w-7 rounded-full text-[11px]"
                          />
                          <span className="text-xs font-semibold text-slate-700 truncate">{p.seller_name || t("Verified Creator")}</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{p.rating ? p.rating.toFixed(1) : "5.0"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex items-center justify-between gap-2 pt-2">
                      <Button
                        onClick={() => setSelectedProduct(p)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl flex-1 text-xs font-bold"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> {t("View & Buy")}
                      </Button>

                      {p.contact_phone ? (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex-1 shadow-md shadow-emerald-600/20"
                        >
                          <a href={`tel:${p.contact_phone}`}>
                            <Phone className="h-3.5 w-3.5 mr-1" /> {t("Call Seller")}
                          </a>
                        </Button>
                      ) : p.product_url ? (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold flex-1"
                        >
                          <a href={p.product_url} target="_blank" rel="noreferrer">
                            {t("Buy Now")} <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setSelectedProduct(p)}
                          size="sm"
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold flex-1"
                        >
                          {t("Contact Seller")}
                        </Button>
                      )}

                      {/* Owner or Admin Delete */}
                      {(user?.id === p.seller_id || user?.role === "admin") && (
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 transition rounded-lg"
                          title={t("Delete product")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PRODUCT DETAILS & PURCHASE INQUIRY MODAL */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {selectedProduct.category}
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{selectedProduct.title}</h2>
                  <p className="mt-1 text-xl font-black text-blue-600">
                    {Number(selectedProduct.price) === 0 ? t("Free / Open Source") : `${Number(selectedProduct.price).toLocaleString()} ${selectedProduct.currency || 'ETB'}`}
                  </p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
              </div>

              {/* Cover Image */}
              <div className="h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <ProductCover
                  src={selectedProduct.image ? getMediaUrl(selectedProduct.image) : selectedProduct.image_url}
                  title={selectedProduct.title}
                  category={selectedProduct.category}
                />
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">{t("Product Description")}</h4>
                <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedProduct.description || selectedProduct.short_description || t("No full description provided.")}
                </div>
              </div>

              {/* Prominent Direct Phone Call Banner */}
              {selectedProduct.contact_phone ? (
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/90 p-5 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                        <PhoneCall className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                          {t("📞 Direct Phone Contact (Call Seller to Buy)")}
                        </span>
                        <p className="text-xl font-extrabold text-slate-950 font-mono tracking-tight mt-0.5">
                          {selectedProduct.contact_phone}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {t("Call or SMS the seller directly to negotiate, arrange payment, or ask questions.")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 px-5 shadow-md shadow-emerald-600/20"
                      >
                        <a href={`tel:${selectedProduct.contact_phone}`}>
                          <Phone className="h-4 w-4 mr-1.5" /> {t("Call Now")}
                        </a>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs h-11 px-4 font-bold"
                      >
                        <a href={`sms:${selectedProduct.contact_phone}`}>
                          <MessageSquare className="h-4 w-4 mr-1.5" /> {t("Send SMS")}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
                  {t("No direct phone number provided. Send an inquiry message below with your phone number so the seller can call you.")}
                </div>
              )}

              {/* Seller Contact Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 font-bold text-blue-700">
                    {selectedProduct.seller_name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedProduct.seller_name || t("Platform Seller")}</p>
                    <p className="text-[11px] text-slate-400">
                      {selectedProduct.contact_phone ? `📞 ${selectedProduct.contact_phone} · ` : ""}
                      {selectedProduct.contact_email || selectedProduct.seller_email}
                    </p>
                  </div>
                </div>

                {selectedProduct.product_url && (
                  <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs">
                    <a href={selectedProduct.product_url} target="_blank" rel="noreferrer">
                      {t("Visit Checkout / Demo")} <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Inquiry Form */}
              <form onSubmit={handleSendInquiry} className="rounded-2xl bg-blue-50/50 border border-blue-100 p-5 space-y-3">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                    {t("Send Direct Inquiry (Seller Will Call You)")}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t("Leave your contact details and phone number so the seller can call you back directly.")}
                  </p>
                </div>

                {inquirySuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{t("Inquiry sent! The seller will call you on your phone number.")}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder={t("Your Name *")}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder={t("Your Email *")}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500"
                  />
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder={t("Your Phone Number * (to call you)")}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <textarea
                  rows={3}
                  required
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  placeholder={t("Ask a question about this product, negotiate price, or request custom features...")}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-blue-500"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={inquirySending} size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold">
                    {inquirySending ? t("Sending...") : t("Send Inquiry with My Phone Number")}
                  </Button>
                </div>
              </form>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedProduct(null)} className="rounded-xl">
                  {t("Close")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* POST A PRODUCT MODAL */}
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 overflow-y-auto">
            <form
              onSubmit={handleCreateProduct}
              className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{t("List a Product on Marketplace")}</h3>
                  <p className="text-xs text-slate-500">{t("Sell dev tools, UI kits, templates, or software assets.")}</p>
                </div>
                <button type="button" onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
              </div>

              {postError && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700 font-semibold">{postError}</div>
              )}

              <label className="block text-xs font-bold uppercase text-slate-600">
                {t("Product Title *")}
                <input
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Next.js SaaS Starter Kit & Admin Dashboard"
                  className={fieldClass}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-600">
                  {t("Category *")}
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="Software & SaaS">{t("Software & SaaS")}</option>
                    <option value="Templates & Themes">{t("Templates & Themes")}</option>
                    <option value="Developer Tools">{t("Developer Tools")}</option>
                    <option value="APIs & Data">{t("APIs & Data")}</option>
                    <option value="AI & Automation">{t("AI & Automation")}</option>
                    <option value="Courses & E-books">{t("Courses & E-books")}</option>
                    <option value="Freelance Services">{t("Freelance Services")}</option>
                  </select>
                </label>

                <label className="block text-xs font-bold uppercase text-slate-600">
                  {t("Price (ETB, 0 for Free) *")}
                  <input
                    type="number"
                    step="1"
                    min="0"
                    required
                    value={postPrice}
                    onChange={(e) => setPostPrice(e.target.value)}
                    placeholder="1500 (0 for free)"
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block text-xs font-bold uppercase text-slate-600">
                {t("Short Catchy Description *")}
                <input
                  required
                  value={postShortDesc}
                  onChange={(e) => setPostShortDesc(e.target.value)}
                  placeholder="A one-sentence summary of what your product does"
                  className={fieldClass}
                />
              </label>

              <label className="block text-xs font-bold uppercase text-slate-600">
                {t("Full Description & Features *")}
                <textarea
                  rows={4}
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="Provide details about stack, features, installation, and license..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-blue-500"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-600">
                  {t("Direct Buy / Live Demo URL")}
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://gumroad.com/... or https://demo.com"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-xs font-bold uppercase text-slate-600">
                  {t("Cover Image (Upload or URL)")}
                  <input
                    type="url"
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    placeholder="https://.../preview.png"
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block text-xs font-bold uppercase text-slate-600">
                {t("Upload Image")}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPostCoverFile(e.target.files?.[0] || null)}
                  className="mt-1.5 block w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold uppercase text-slate-600">
                  {t("Seller Contact Email *")}
                  <input
                    type="email"
                    required
                    value={postContactEmail}
                    onChange={(e) => setPostContactEmail(e.target.value)}
                    placeholder="seller@example.com"
                    className={fieldClass}
                  />
                </label>

                <label className="block text-xs font-bold uppercase text-slate-600">
                  {t("Contact Phone Number * (Buyers will call you)")}
                  <input
                    type="tel"
                    required
                    value={postContactPhone}
                    onChange={(e) => setPostContactPhone(e.target.value)}
                    placeholder="e.g. 0911234567 or +251 91 234 5678"
                    className={fieldClass}
                  />
                </label>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-2">
                {t("📞 Required: Buyers will use this phone number to call or message you directly to complete purchases.")}
              </p>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsPostModalOpen(false)} className="rounded-xl">
                  {t("Cancel")}
                </Button>
                <Button type="submit" disabled={posting} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                  {posting ? t("Publishing...") : t("Publish to Marketplace")}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
