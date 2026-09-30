import React, { useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Mail,
  Save,
  CheckCircle2,
  Lock,
  Globe,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";

export function AdminSettingsPage() {
  const { isDark } = useAdminTheme();
  const [siteName, setSiteName] = useState("Nana jobs Tech Job Board");
  const [supportEmail, setSupportEmail] = useState("admin@nanajobs.com");
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [requireCompanyVerification, setRequireCompanyVerification] = useState(false);
  const [maxFreeJobs, setMaxFreeJobs] = useState("10");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="System Configuration & Platform Settings"
      subtitle="Configure platform parameters, security policies, and moderation behaviors."
    >
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* General Settings */}
        <section className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${cardBg}`}>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700/40 font-extrabold text-base">
            <Globe className="h-5 w-5 text-blue-500" /> General Platform Configuration
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className={`h-11 w-full rounded-xl px-4 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Administrative Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className={`h-11 w-full rounded-xl px-4 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-bold">Platform Maintenance Mode</p>
              <p className="text-[11px] text-slate-400">Temporarily restrict public job posting and applications for upgrades.</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-5 w-5 rounded accent-blue-600 cursor-pointer"
            />
          </div>
        </section>

        {/* Security & Verification Policies */}
        <section className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${cardBg}`}>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700/40 font-extrabold text-base">
            <Lock className="h-5 w-5 text-indigo-500" /> Security & Account Rules
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Require Email Verification for All Accounts</p>
                <p className="text-[11px] text-slate-400">Users must verify their email address before publishing jobs or applying.</p>
              </div>
              <input
                type="checkbox"
                checked={requireEmailVerification}
                onChange={(e) => setRequireEmailVerification(e.target.checked)}
                className="h-5 w-5 rounded accent-blue-600 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* Job Limits & Quotas */}
        <section className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${cardBg}`}>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-700/40 font-extrabold text-base">
            <Sliders className="h-5 w-5 text-purple-500" /> Employer Quotas & Limits
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Max Active Jobs Per Free Company</label>
            <input
              type="number"
              value={maxFreeJobs}
              onChange={(e) => setMaxFreeJobs(e.target.value)}
              className={`h-11 w-full rounded-xl px-4 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
            />
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Platform settings saved successfully.
            </span>
          ) : <div />}

          <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold flex items-center gap-2">
            <Save className="h-4 w-4" /> Save System Settings
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
