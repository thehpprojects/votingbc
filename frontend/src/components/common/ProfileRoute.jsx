// ======================================
// Profile Route Wrapper (chooses layout by role)
// ======================================

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminLayout from "../../layouts/AdminLayout";
import VoterLayout from "../../layouts/VoterLayout";
import ProfilePage from "../../pages/ProfilePage";

/**
 * Renders ProfilePage inside the correct dashboard layout,
 * based on the currently authenticated role.
 */
export default function ProfileRoute() {
  const { isAdmin, isVoter } = useAuth();

  if (isAdmin) {
    return (
      <AdminLayout>
        <ProfilePage />
      </AdminLayout>
    );
  }
  if (isVoter) {
    return (
      <VoterLayout>
        <ProfilePage />
      </VoterLayout>
    );
  }
  return <Navigate to="/login" replace />;
}
