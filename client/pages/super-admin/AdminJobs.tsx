import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  Search,
  Star,
  Trash2,
  Eye,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";
import CompanyLogo from "@/components/CompanyLogo";

export function AdminJobsPage() {
  const { isDark } = useAdminTheme();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fetchJobs = () => {
    setLoading(true);
    adminApi.getJobs({ q: search, status: statusFilter })
      .then((res) => {
        if (res.results) setJobs(res.results);
        else if (Array.isArray(res)) setJobs(res);
        else if (res.data) setJobs(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter]);

  const handleToggleFeature = async (job: any) => {
    setActionLoading(job.id);
    try {
      await adminApi.toggleFeatureJob(job.id);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || "Failed to toggle featured status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (job: any) => {
    if (!window.confirm(`Are you sure you want to permanently delete the job posting "${job.title}"?`)) return;
    setActionLoading(job.id);
    try {
      await adminApi.deleteJob(job.id);
      fetchJobs();
    } catch (err: any) {
      alert(err.message || "Failed to delete job");
    } finally {
      setActionLoading(null);
    }
  };

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="Job Listings Moderation Console"
      subtitle="Review, promote, and moderate all platform job postings across employers."
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${cardBg}`}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-11 w-full rounded-xl pl-10 pr-4 text-xs outline-none transition border ${
                isDark ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500"
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`h-11 rounded-xl px-3.5 text-xs font-semibold outline-none border ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <option value="">All Statuses</option>
              <option value="published">Published / Live</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed / Archived</option>
            </select>
            <span className="text-xs font-bold text-slate-400">Total: {jobs.length} Listings</span>
          </div>
        </div>

        {/* Jobs Table */}
        <div className={`overflow-hidden rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                <tr>
                  <th className="px-5 py-4">Job Title & Employer</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Workplace</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Featured Badge</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/80" : "divide-slate-100"}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">Loading job postings...</td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">No job postings found.</td>
                  </tr>
                ) : (
                  jobs.map((j) => (
                    <tr key={j.id} className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/70"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <CompanyLogo src={j.company?.logo || j.company_logo} name={j.company?.company_name || j.company_name} size="sm" />
                          <div>
                            <div className="font-bold text-sm">{j.title}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {j.company?.company_name || j.company_name || "Company"} {j.location ? `· ${j.location}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                          {j.category?.name || "General"}
                        </span>
                      </td>
                      <td className="px-5 py-4 capitalize text-slate-400 font-medium">
                        {j.workplace_type || "Remote"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          j.status === "published"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : j.status === "draft"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoading === j.id}
                          onClick={() => handleToggleFeature(j)}
                          className={`rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                            j.is_featured ? "text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/40" : "text-slate-400"
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${j.is_featured ? "fill-amber-500 text-amber-500" : ""}`} />
                          {j.is_featured ? "Featured" : "Standard"}
                        </Button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedJob(j)}
                            className="rounded-xl text-xs p-2 text-slate-400 hover:text-blue-500"
                            title="Inspect Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-xs"
                          >
                            <Link to={`/jobs/${j.slug || j.id}`} target="_blank">
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={actionLoading === j.id}
                            onClick={() => handleDeleteJob(j)}
                            className="rounded-xl text-xs p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            title="Remove Job Posting"
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

        {/* JOB DETAILS INSPECTION MODAL */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto ${isDark ? "bg-[#0e1424] border-slate-700" : "bg-white border-slate-200"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-extrabold">{selectedJob.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedJob.company?.company_name || selectedJob.company_name} · {selectedJob.location || "Remote"}
                  </p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white p-2">✕</button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                  <span className="font-bold">{selectedJob.category?.name || "General"}</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Job Type</span>
                  <span className="font-bold capitalize">{selectedJob.job_type || "Full-time"}</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Workplace</span>
                  <span className="font-bold capitalize">{selectedJob.workplace_type || "Remote"}</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <span className="font-bold capitalize text-emerald-500">{selectedJob.status}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h4>
                <div className={`p-4 rounded-2xl text-xs leading-relaxed max-h-48 overflow-y-auto border ${isDark ? "bg-slate-900/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                  {selectedJob.description}
                </div>
              </div>

              {selectedJob.requirements && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Requirements</h4>
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed max-h-36 overflow-y-auto border ${isDark ? "bg-slate-900/50 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                    {selectedJob.requirements}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="outline" onClick={() => setSelectedJob(null)} className="rounded-xl text-xs">
                  Close
                </Button>
                <Button
                  onClick={() => { handleDeleteJob(selectedJob); setSelectedJob(null); }}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  Delete Job
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
