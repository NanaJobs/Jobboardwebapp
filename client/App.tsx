import "./global.css";

import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LocaleProvider } from "./lib/i18n";
import { AuthProvider, useAuth } from "./lib/auth-context";

import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import {
  AboutPage,
  AdminPage,
  ApplicantDashboard,
  AuthPage,
  CompanyDashboard,
  CompanyPage,
  ContactPage,
} from "./pages/PortalPages";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import {
  ApplicationsPage,
  CompanyOverviewPage,
  MarketplacePage,
  ProfilePage,
  SavedJobsPage,
} from "./pages/FeaturePages";
import CompanyApplications from "./pages/CompanyApplications";
import TalentPage from "./pages/TalentPage";

import {
  AdminThemeProvider,
  AdminDashboardPage,
  AdminUsersPage,
  AdminJobsPage,
  AdminCompaniesPage,
  AdminCategoriesPage,
  AdminAnalyticsPage,
  AdminSecurityPage,
  AdminSettingsPage,
} from "./pages/super-admin";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminThemeProvider>
        <LocaleProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route
                  path="/marketplace"
                  element={
                    <ProtectedRoute>
                      <MarketplacePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage register />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Applicant Portal */}
                <Route
                  path="/applicant/dashboard"
                  element={
                    <ProtectedRoute>
                      <ApplicantDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applicant/applications"
                  element={
                    <ProtectedRoute>
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applicant/saved-jobs"
                  element={
                    <ProtectedRoute>
                      <SavedJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/applicant/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Company Portal */}
                <Route
                  path="/company/dashboard"
                  element={
                    <ProtectedRoute>
                      <CompanyDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/applications"
                  element={
                    <ProtectedRoute>
                      <CompanyApplications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/jobs"
                  element={
                    <ProtectedRoute>
                      <CompanyPage type="jobs" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/jobs/create"
                  element={
                    <ProtectedRoute>
                      <CompanyPage type="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/talent"
                  element={
                    <ProtectedRoute>
                      <TalentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/candidates"
                  element={
                    <ProtectedRoute>
                      <TalentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/company/profile"
                  element={
                    <ProtectedRoute>
                      <CompanyPage type="profile" />
                    </ProtectedRoute>
                  }
                />

                {/* Super Admin Complete Module */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/jobs"
                  element={
                    <ProtectedRoute>
                      <AdminJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/companies"
                  element={
                    <ProtectedRoute>
                      <AdminCompaniesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/verification"
                  element={
                    <ProtectedRoute>
                      <AdminCompaniesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute>
                      <AdminCategoriesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute>
                      <AdminAnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/security"
                  element={
                    <ProtectedRoute>
                      <AdminSecurityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute>
                      <AdminSecurityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <AdminSettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Index />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LocaleProvider>
      </AdminThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
