import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Globe,
  ExternalLink,
  Briefcase,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketplaceApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";
import CompanyLogo from "@/components/CompanyLogo";

export function AdminCompaniesPage() {
  const { isDark } = useAdminTheme();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCompanies = () => {
    setLoading(true);
    marketplaceApi.getCompanies({ q: search })
      .then((res) => {
        if (res.results) setCompanies(res.results);
        else if (Array.isArray(res)) setCompanies(res);
        else if (res.data) setCompanies(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="Company Profiles & Employer Directory"
      subtitle="Overview of all registered companies, active job counts, and employer profiles."
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${cardBg}`}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-11 w-full rounded-xl pl-10 pr-4 text-xs outline-none transition border ${
                isDark ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500"
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Total: {companies.length} Companies</span>
          </div>
        </div>

        {/* Company Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading company directory...</div>
        ) : companies.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border ${cardBg}`}>
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-extrabold text-sm">No companies found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => (
              <div
                key={c.id}
                className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition hover:shadow-xl ${cardBg}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <CompanyLogo src={c.logo} name={c.company_name} size="lg" />
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Email Verified
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-extrabold">{c.company_name}</h3>
                  {c.tagline && <p className="mt-1 text-xs text-slate-500 line-clamp-2">{c.tagline}</p>}

                  <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                    {c.headquarters && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> {c.headquarters}
                      </div>
                    )}
                    {c.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate">
                          {c.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`mt-6 pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-100"} flex items-center justify-between`}>
                  <span className="text-xs font-bold text-slate-400">
                    {c.active_jobs_count || 0} Active {c.active_jobs_count === 1 ? "Job" : "Jobs"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-xl text-xs flex items-center gap-1.5">
                      <Link to={`/jobs?company=${c.id}`} target="_blank">
                        View Jobs <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
