import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Briefcase,
  FileText,
  Building2,
  Download,
  Calendar,
  Layers,
  Sparkles,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardApi, adminApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";

export function AdminAnalyticsPage() {
  const { isDark } = useAdminTheme();
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardApi.getAdminDashboard(),
      adminApi.getCategories()
    ])
      .then(([dashRes, catRes]) => {
        if (dashRes.data) setData(dashRes.data);
        if (catRes.results) setCategories(catRes.results);
        else if (Array.isArray(catRes)) setCategories(catRes);
        else if (catRes.data) setCategories(catRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = "data:text/csv;charset=utf-8," + [
      "Metric,Value",
      `Total Registered Users,${data.user_metrics?.total_users || 0}`,
      `Employer Accounts,${data.user_metrics?.company_users || 0}`,
      `Candidate Accounts,${data.user_metrics?.applicant_users || 0}`,
      `Total Jobs Posted,${data.job_metrics?.total_jobs || 0}`,
      `Active Live Jobs,${data.job_metrics?.active_jobs || 0}`,
      `Total Applications,${data.application_metrics?.total_applications || 0}`,
      `Hiring Conversion Rate,${data.application_metrics?.hiring_conversion_rate_percentage || 0}%`,
    ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nanajobs_platform_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="Platform Performance & Growth Analytics"
      subtitle="Comprehensive metrics on candidate acquisition, job posting volume, and hiring conversion."
      actions={
        <Button onClick={handleExportCSV} size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5">
          <Download className="h-4 w-4" /> Export CSV Report
        </Button>
      }
    >
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Compiling analytical metrics...</div>
      ) : (
        <div className="space-y-8">
          {/* Top Analytical Metric Highlights */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversion Efficiency</span>
              <p className="mt-2 text-3xl font-extrabold text-blue-500">
                {data?.application_metrics?.hiring_conversion_rate_percentage || 0}%
              </p>
              <p className="mt-1 text-xs text-emerald-500 font-semibold">Accepted candidates / Total applications</p>
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate / Job Ratio</span>
              <p className="mt-2 text-3xl font-extrabold text-indigo-500">
                {data?.job_metrics?.active_jobs ? ((data.application_metrics?.total_applications || 0) / data.job_metrics.active_jobs).toFixed(1) : 0}
              </p>
              <p className="mt-1 text-xs text-slate-400 font-semibold">Average applications per active role</p>
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Pool Share</span>
              <p className="mt-2 text-3xl font-extrabold text-purple-500">
                {data?.user_metrics?.total_users ? `${Math.round(((data.user_metrics?.applicant_users || 0) / data.user_metrics.total_users) * 100)}%` : "0%"}
              </p>
              <p className="mt-1 text-xs text-purple-400 font-semibold">Job seekers vs Employers</p>
            </div>

            <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Fill Rate</span>
              <p className="mt-2 text-3xl font-extrabold text-emerald-500">
                {data?.job_metrics?.total_jobs ? `${Math.round(((data.job_metrics?.closed_jobs || 0) / data.job_metrics.total_jobs) * 100)}%` : "0%"}
              </p>
              <p className="mt-1 text-xs text-emerald-400 font-semibold">Completed / Closed hiring cycles</p>
            </div>
          </div>

          {/* User & Job Distribution Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Demographics Ratio */}
            <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <h3 className="text-base font-extrabold flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-500" /> User Community Composition
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Candidates / Job Seekers</span>
                    <span>{data?.user_metrics?.applicant_users || 0} accounts</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${data?.user_metrics?.total_users ? ((data.user_metrics?.applicant_users || 0) / data.user_metrics.total_users) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Hiring Employers & Companies</span>
                    <span>{data?.user_metrics?.company_users || 0} accounts</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: `${data?.user_metrics?.total_users ? ((data.user_metrics?.company_users || 0) / data.user_metrics.total_users) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Platform Super Admins</span>
                    <span>{data?.user_metrics?.super_admin_users || 1} accounts</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${data?.user_metrics?.total_users ? ((data.user_metrics?.super_admin_users || 1) / data.user_metrics.total_users) * 100 : 5}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Industry Categories Breakdown */}
            <div className={`p-6 rounded-3xl border shadow-sm ${cardBg}`}>
              <h3 className="text-base font-extrabold flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-indigo-500" /> Active Industry Verticals
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No categories configured yet.</p>
                ) : (
                  categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <span className="font-bold">{cat.name}</span>
                      <span className="font-mono text-slate-400">{cat.slug}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
