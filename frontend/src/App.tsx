import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import Login from "@/pages/Login";
import SetupPassword from "@/pages/SetupPassword";
import Settings from "@/pages/Settings";
import Home from "@/pages/home";
import RecruiterDashboard from "@/pages/RecruiterDashboard";
import CandidateDashboard from "@/pages/CandidateDashboard";
import BenchmarkingDashboard from "@/pages/BenchmarkingDashboard";
import MonitoringDashboard from "@/pages/MonitoringDashboard";
import ComparisonDashboard from "@/pages/ComparisonDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminRecruiters from "@/pages/AdminRecruiters";
import AdminCandidates from "@/pages/AdminCandidates";
import AdminReports from "@/pages/AdminReports";
import AdminAnalytics from "@/pages/AdminAnalytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/setup-password" component={SetupPassword} />
      <Route path="/">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route path="/recruiter-dashboard">
        <ProtectedRoute>
          <RecruiterDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/candidate-dashboard/:interviewId">
        <ProtectedRoute>
          <CandidateDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/benchmarking">
        <ProtectedRoute>
          <BenchmarkingDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/monitoring">
        <ProtectedRoute>
          <MonitoringDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/comparison">
        <ProtectedRoute>
          <ComparisonDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/recruiters">
        <ProtectedRoute>
          <AdminRecruiters />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/candidates">
        <ProtectedRoute>
          <AdminCandidates />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute>
          <AdminReports />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute>
          <AdminAnalytics />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
