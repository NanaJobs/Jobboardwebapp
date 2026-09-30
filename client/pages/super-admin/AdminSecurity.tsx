import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  UserX,
  Eye,
  Filter,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi, adminApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";

export function AdminSecurityPage() {
  const { isDark } = useAdminTheme();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchReports = () => {
    setLoading(true);
    reportsApi.getAdminReports({ status: statusFilter })
      .then((res) => {
        if (res.results) setReports(res.results);
        else if (Array.isArray(res)) setReports(res);
        else if (res.data) setReports(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleResolve = async (action: string, status: string = "action_taken") => {
    if (!selectedReport) return;
    setActionLoading(selectedReport.id);
    try {
      await reportsApi.resolveAdminReport(selectedReport.id, {
        status,
        action_taken: action,
        admin_notes: adminNotes || `Action executed: ${action}`,
      });
      setSelectedReport(null);
      setAdminNotes("");
      fetchReports();
    } catch (err: any) {
      alert(err.message || "Failed to resolve report");
    } finally {
      setActionLoading(null);
    }
  };

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="Security & Content Moderation Queue"
      subtitle="Investigate user violation reports, eliminate spam jobs, and audit enforcement actions."
    >
      <div className="space-y-6">
        {/* Status Filter Toolbar */}
        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between gap-4 ${cardBg}`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Filter By Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`h-10 rounded-xl px-3 text-xs font-semibold outline-none border ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <option value="">All Reports</option>
              <option value="pending">Pending Investigation</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved / Action Taken</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {reports.length} Reports</span>
        </div>

        {/* Reports Queue List */}
        <div className={`overflow-hidden rounded-3xl border shadow-sm ${cardBg}`}>
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading violation reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-16 text-center">
              <ShieldCheck className="h-14 w-14 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-extrabold text-sm">Platform is clean & secure</h3>
              <p className="text-xs text-slate-500 mt-1">No open violation reports require administrative action.</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
              {reports.map((r) => (
                <div key={r.id} className="p-6 transition hover:bg-slate-500/5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                          {r.reason_display || r.reason}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                        }`}>
                          Target: {r.target_type}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          r.status === "pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {r.status_display || r.status}
                        </span>
                      </div>

                      <p className="text-sm font-extrabold pt-1">{r.description}</p>

                      <p className="text-xs text-slate-400">
                        Reported by <span className="font-mono text-slate-500">{r.reporter_info?.email || "Community User"}</span> · {new Date(r.created_at).toLocaleDateString()}
                      </p>

                      {r.admin_notes && (
                        <div className={`mt-2 p-2.5 rounded-xl text-xs font-mono border ${isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"}`}>
                          <span className="font-bold text-slate-500 block">Resolution Note:</span> {r.admin_notes}
                        </div>
                      )}
                    </div>

                    {r.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => setSelectedReport(r)}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold"
                        >
                          Take Action →
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTION RESOLUTION MODAL */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-5 ${isDark ? "bg-[#0e1424] border-slate-700" : "bg-white border-slate-200"}`}>
              <h3 className="text-lg font-extrabold text-red-500 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" /> Resolve Violation Report
              </h3>

              <div className={`p-4 rounded-2xl border text-xs space-y-1 ${isDark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <p><span className="font-bold text-slate-400">Reason:</span> {selectedReport.reason}</p>
                <p><span className="font-bold text-slate-400">Description:</span> {selectedReport.description}</p>
                <p><span className="font-bold text-slate-400">Target Type:</span> {selectedReport.target_type}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Administrative Notes</label>
                <textarea
                  rows={2}
                  placeholder="Reason for decision, audit log comments..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className={`w-full rounded-xl p-3 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                />
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold uppercase text-slate-400">Choose Enforcement Action:</p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedReport.target_type === "job" && (
                    <Button
                      type="button"
                      disabled={actionLoading === selectedReport.id}
                      onClick={() => handleResolve("job_removed")}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                    >
                      Remove Job
                    </Button>
                  )}
                  {selectedReport.target_type === "user" && (
                    <Button
                      type="button"
                      disabled={actionLoading === selectedReport.id}
                      onClick={() => handleResolve("user_suspended")}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                    >
                      Suspend User
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actionLoading === selectedReport.id}
                    onClick={() => handleResolve("warning_issued")}
                    className="rounded-xl text-xs font-bold"
                  >
                    Issue Warning
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={actionLoading === selectedReport.id}
                    onClick={() => handleResolve("dismissed", "dismissed")}
                    className="rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Dismiss Report
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <Button variant="outline" onClick={() => setSelectedReport(null)} className="rounded-xl text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
