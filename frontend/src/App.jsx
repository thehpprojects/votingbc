// ======================================
// App Router
// ======================================

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import VoterLayout from "./layouts/VoterLayout";

// Guards
import ProtectedRoute from "./components/common/ProtectedRoute";
import ProfileRoute from "./components/common/ProfileRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import ResultsPage from "./pages/ResultsPage";
import NotFoundPage from "./pages/NotFoundPage";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminElection from "./pages/admin/AdminElection";
import AdminVoters from "./pages/admin/AdminVoters";
import AdminResults from "./pages/admin/AdminResults";

// Voter pages
import VoterDashboard from "./pages/voter/VoterDashboard";
import VoterCandidateList from "./pages/voter/VoterCandidateList";
import VotingPage from "./pages/voter/VotingPage";
import VoterResults from "./pages/voter/VoterResults";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              fontWeight: 500,
              fontSize: "14px",
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Route>

          {/* Admin (protected) */}
          <Route element={<ProtectedRoute type="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="candidates" element={<AdminCandidates />} />
              <Route path="election" element={<AdminElection />} />
              <Route path="voters" element={<AdminVoters />} />
              <Route path="results" element={<AdminResults />} />
            </Route>
          </Route>

          {/* Voter (protected) */}
          <Route element={<ProtectedRoute type="voter" />}>
            <Route path="/voter" element={<VoterLayout />}>
              <Route index element={<VoterDashboard />} />
              <Route path="candidates" element={<VoterCandidateList />} />
              <Route path="vote" element={<VotingPage />} />
              <Route path="results" element={<VoterResults />} />
            </Route>
          </Route>

          {/* Shared profile (protected by either role) */}
          <Route path="/profile" element={<ProfileRoute />} />

          {/* 404 */}
          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
