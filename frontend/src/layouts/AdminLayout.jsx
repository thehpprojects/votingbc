// ======================================
// Admin Dashboard Layout
// ======================================

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaUsers,
  FaVoteYea,
  FaFlagCheckered,
  FaUserTie,
} from "react-icons/fa";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: FaTachometerAlt, end: true },
  { to: "/admin/candidates", label: "Candidates", icon: FaUsers },
  { to: "/admin/election", label: "Election Control", icon: FaVoteYea },
  { to: "/admin/voters", label: "Registered Voters", icon: FaUserTie },
  { to: "/admin/results", label: "Results", icon: FaFlagCheckered },
];

export default function AdminLayout({ children }) {
  const { admin, adminLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-midnight-950">
      <Sidebar
        items={navItems}
        title="VoteChain"
        subtitle="Admin Panel"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={admin}
          onLogout={handleLogout}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
