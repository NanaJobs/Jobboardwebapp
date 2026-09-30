import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  Edit,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { AdminLayout } from "./AdminLayout";
import { useAdminTheme } from "./AdminThemeContext";
import UserAvatar from "@/components/UserAvatar";

export function AdminUsersPage() {
  const { isDark } = useAdminTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ q: search, role: roleFilter })
      .then((res) => {
        if (res.data) setUsers(res.data);
        else if (res.results) setUsers(res.results);
        else if (Array.isArray(res)) setUsers(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleSuspend = async (user: any) => {
    const action = user.is_suspended ? "activate" : "suspend";
    setActionLoading(user.id);
    try {
      await adminApi.suspendUser(user.id, action);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${user.email}? This action cannot be undone.`)) return;
    setActionLoading(user.id);
    try {
      await adminApi.deleteUser(user.id);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    setActionLoading(selectedUser.id);
    try {
      await adminApi.updateUser(selectedUser.id, { role: newRole });
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to change user role");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleManualVerify = async (user: any) => {
    setActionLoading(user.id);
    try {
      await adminApi.updateUser(user.id, { is_verified: !user.is_verified });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Failed to toggle email verification");
    } finally {
      setActionLoading(null);
    }
  };

  const cardBg = isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200";

  return (
    <AdminLayout
      title="User Accounts & Access Management"
      subtitle="Supervise all registered candidates, employers, and administrator accounts."
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className={`p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${cardBg}`}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`h-11 w-full rounded-xl pl-10 pr-4 text-xs outline-none transition border ${
                isDark ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500"
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`h-11 rounded-xl px-3.5 text-xs font-semibold outline-none border ${
                isDark ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <option value="">All Roles</option>
              <option value="applicant">Job Seekers</option>
              <option value="company">Employers</option>
              <option value="super_admin">Super Admins</option>
            </select>
            <span className="text-xs font-bold text-slate-400">Total: {users.length}</span>
          </div>
        </div>

        {/* User Accounts Table */}
        <div className={`overflow-hidden rounded-3xl border shadow-sm ${cardBg}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${isDark ? "bg-slate-900/80 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                <tr>
                  <th className="px-5 py-4">User Account</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Email Verified</th>
                  <th className="px-5 py-4">Joined Date</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-slate-800/80" : "divide-slate-100"}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">Loading user accounts...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400">No users found matching your filters.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/70"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar src={u.avatar} name={u.first_name || u.email} size="sm" />
                          <div>
                            <div className="font-bold text-sm">{u.first_name} {u.last_name || "User"}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === "company"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            : u.role === "super_admin"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {u.is_suspended ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                            Suspended
                          </span>
                        ) : u.is_active ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleToggleManualVerify(u)}
                          disabled={actionLoading === u.id || u.role === "super_admin"}
                          className={`flex items-center gap-1.5 font-semibold text-xs transition ${u.is_verified ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"}`}
                          title="Click to toggle verification status"
                        >
                          {u.is_verified ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {u.is_verified ? "Verified" : "Unverified"}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {u.role !== "super_admin" && (
                            <Button
                              size="sm"
                              variant={u.is_suspended ? "outline" : "ghost"}
                              disabled={actionLoading === u.id}
                              onClick={() => handleToggleSuspend(u)}
                              className={`rounded-xl text-xs font-semibold ${
                                u.is_suspended
                                  ? "border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                  : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                              }`}
                            >
                              {u.is_suspended ? "Activate" : "Suspend"}
                            </Button>
                          )}
                          {u.role !== "super_admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setSelectedUser(u); setNewRole(u.role); }}
                              className="rounded-xl text-xs p-2 text-slate-500 hover:text-blue-500"
                              title="Edit Role"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {u.role !== "super_admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={actionLoading === u.id}
                              onClick={() => handleDeleteUser(u)}
                              className="rounded-xl text-xs p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROLE UPDATE MODAL */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl space-y-5 ${isDark ? "bg-[#0e1424] border-slate-700" : "bg-white border-slate-200"}`}>
              <h3 className="text-base font-extrabold">Change Account Role</h3>
              <p className="text-xs text-slate-500">
                Updating permissions for <span className="font-bold text-slate-900 dark:text-white">{selectedUser.email}</span>
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Select New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className={`w-full h-11 rounded-xl px-3 text-xs outline-none border ${isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"}`}
                >
                  <option value="applicant">Applicant (Job Seeker)</option>
                  <option value="company">Company (Employer)</option>
                  <option value="super_admin">Super Admin (Platform Owner)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-xs">
                  Save Role
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
