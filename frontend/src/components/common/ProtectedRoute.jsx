// ======================================
// Protected Route
// ======================================

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageLoader from "./PageLoader";

/**
 * Guards routes based on auth type: "admin" or "voter".
 */
export default function ProtectedRoute({ type }) {
  const { isAdmin, isVoter, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (type === "admin" && !isAdmin) return <Navigate to="/login?role=admin" replace />;
  if (type === "voter" && !isVoter) return <Navigate to="/login?role=voter" replace />;

  return <Outlet />;
}
