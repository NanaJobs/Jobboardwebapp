import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Building2,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi, reportsApi, dashboardApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";

export function AdminDashboardPage() {
  const { isDark } = useAdminTheme();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    Promise.all([
      dashboardApi.getAdminDashboard(),
      reportsApi.getAdminReports({ status: "pending" })
    ])
      .then(([dashRes, repRes]) => {
        if (dashRes.data) setDashboardData(dashRes.data);
        if (repRes.results) setPendingReports(repRes.results);
        else if (Array.isArray(repRes)) setPendingReports(repRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200/90";

  return (
    <AdminLayout
      title="Platform Operations Dashboard"
      subtitle="Real-time supervision, system growth metrics, and administrative oversight."
      actions={
        <Button asChild size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs">
          <Link to="/admin/analytics">View Deep Analytics →</Link>
        </Button>
      }
    >
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading platform health metrics...</div>
      ) : (
        <div className="space-y-8">
          {/* QUICK STATS 6-CARD GRID */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Total Users */}
            <div className={`p-5 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{dashboardData?.user_metrics?.total_users || 0}</p>
              <p className="mt-1 text-[11px] text-emerald-500 font-bold">↑ Active Platform</p>
            </div>

            {/* Companies */}
            <div className={`p-5 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Companies</span>
                <Building2 className="h-4 w-4 text-purple-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{dashboardData?.user_metrics?.company_users || 0}</p>
              <p className="mt-1 text-[11px] text-purple-400 font-semibold">Registered Employers</p>
            </div>

            {/* Applicants */}
            <div className={`p-5 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidates</span>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{dashboardData?.user_metrics?.applicant_users || 0}</p>
              <p className="mt-1 text-[11px] text-emerald-400 font-semibold">Job Seekers</p>
            </div>

            {/* Active Jobs */}
            <div className={`p-5 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
                <Briefcase className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{dashboardData?.job_metrics?.active_jobs || 0}</p>
              <p className="mt-1 text-[11px] text-slate-400">Total: {dashboardData?.job_metrics?.total_jobs || 0}</p>
            </div>

            {/* Applications */}
            <div className={`p-5 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applications</span>
                <FileText className="h-4 w-4 text-indigo-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{dashboardData?.application_metrics?.total_applications || 0}</p>
              <p className="mt-1 text-[11px] text-indigo-400 font-semibold">Submissions</p>
            </div>

            {/* Conversion Rate */}
            <div className={`p-5 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion</span>
                <TrendingUp className="h-4 w-4 text-rose-500" />
              </div>
              <p className="mt-3 text-2xl font-extrabold">{dashboardData?.application_metrics?.hiring_conversion_rate_percentage || 0}%</p>
              <p className="mt-1 text-[11px] text-emerald-500 font-bold">Hiring Rate</p>
            </div>
          </div>

          {/* PENDING VIOLATION REPORTS BANNER */}
          {pendingReports.length > 0 && (
            <div className={`p-6 rounded-3xl border ${isDark ? "bg-red-950/30 border-red-800/60" : "bg-red-50 border-red-200"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-600 text-white font-bold shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-red-950 dark:text-red-300">
                      {pendingReports.length} Open Violation {pendingReports.length === 1 ? "Report" : "Reports"} Pending Moderation
                    </h3>
                    <p className="text-xs text-red-800 dark:text-red-400 mt-0.5">
                      Platform users have flagged content for scam, duplicate, or inappropriate violations.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs shrink-0">
                  <Link to="/admin/security">Review Moderation Queue →</Link>
                </Button>
              </div>
            </div>
          )}

          {/* RECENT ACTIVITY DOUBLE COLUMN */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Users */}
            <section className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" /> Recent User Registrations
                </h3>
                <Link to="/admin/users" className="text-xs font-bold text-blue-500 hover:underline">Manage All →</Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboardData?.recent_activity?.recent_users?.map((u: any) => (
                  <div key={u.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold">{u.first_name} {u.last_name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      u.role === "company" ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                    }`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Jobs */}
            <section className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-amber-500" /> Recent Job Postings
                </h3>
                <Link to="/admin/jobs" className="text-xs font-bold text-blue-500 hover:underline">Moderate All →</Link>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboardData?.recent_activity?.recent_jobs?.map((j: any) => (
                  <div key={j.id} className="py-3 flex items-center justify-between">
                    <div className="max-w-[70%]">
                      <p className="text-xs font-bold truncate">{j.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{j.company__email}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      j.status === "published" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {j.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
