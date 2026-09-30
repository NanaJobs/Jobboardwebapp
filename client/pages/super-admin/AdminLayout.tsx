import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Layers,
  BarChart3,
  ShieldAlert,
  Settings,
  Sun,
  Moon,
  LogOut,
  ArrowLeft,
  Search,
  Bell,
  Sparkles,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useAdminTheme } from "./AdminThemeContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "User Management", href: "/admin/users", icon: Users },
  { label: "Job Moderation", href: "/admin/jobs", icon: Briefcase },
  { label: "Companies & Directory", href: "/admin/companies", icon: Building2 },
  { label: "Job Categories", href: "/admin/categories", icon: Layers },
  { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Security & Moderation", href: "/admin/security", icon: ShieldAlert },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useAdminTheme();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-200 ${isDark ? "bg-[#0b0f19] text-slate-100" : "bg-[#f8fafc] text-slate-900"}`}>
      {/* SIDEBAR NAVIGATION (DESKTOP) */}
      <aside className={`hidden lg:flex w-72 flex-col justify-between border-r ${isDark ? "bg-[#0e1424] border-slate-800" : "bg-white border-slate-200"} p-5 sticky top-0 h-screen z-30`}>
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black shadow-lg shadow-blue-500/20">
                N
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block">Nana jobs Super</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 block -mt-0.5">Admin Console</span>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold"
                      : isDark
                      ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : isDark ? "text-slate-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Actions */}
        <div className={`pt-4 border-t ${isDark ? "border-slate-800" : "border-slate-100"} space-y-3`}>
          <Link
            to="/"
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition ${isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Public Site
          </Link>

          <div className={`p-3 rounded-2xl ${isDark ? "bg-slate-800/50" : "bg-slate-50"} flex items-center justify-between`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                SA
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.email || "Super Admin"}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase">Root Admin</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-lg transition ${isDark ? "text-slate-400 hover:text-red-400 hover:bg-red-950/40" : "text-slate-500 hover:text-red-600 hover:bg-red-50"}`}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsMobileNavOpen(false)} />
          <div className={`relative w-72 max-w-[80vw] h-full ${isDark ? "bg-[#0e1424]" : "bg-white"} p-5 z-50 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-700/40">
                <span className="font-extrabold text-base">Super Admin</span>
                <button onClick={() => setIsMobileNavOpen(false)} className="p-1.5 rounded-lg text-slate-400">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileNavOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                        isActive ? "bg-blue-600 text-white font-bold" : isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
            <Button onClick={handleLogout} variant="outline" className="w-full text-xs">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Toolbar */}
        <header className={`h-16 border-b sticky top-0 z-20 backdrop-blur-md px-5 sm:px-8 flex items-center justify-between ${isDark ? "bg-[#0b0f19]/80 border-slate-800" : "bg-white/80 border-slate-200"}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-700 text-slate-400"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${isDark ? "bg-blue-950 text-blue-400 border border-blue-800/40" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                Live Environment 🟢
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-2xl border transition flex items-center gap-1.5 text-xs font-bold ${
                isDark
                  ? "border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
            </button>

            {/* Direct Link to Security Queue */}
            <Link
              to="/admin/security"
              className={`relative p-2.5 rounded-2xl border transition ${isDark ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
              title="Moderation Queue"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                !
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-5 sm:p-8 max-w-7xl w-full mx-auto flex-1">
          {/* Header Title Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
              {subtitle && <p className={`mt-1 text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
