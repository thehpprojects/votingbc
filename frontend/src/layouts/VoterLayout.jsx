// ======================================
// Voter Dashboard Layout
// ======================================

import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "../hooks/useWallet";
import {
  FaTachometerAlt,
  FaListUl,
  FaVoteYea,
  FaFlagCheckered,
  FaUserCircle,
} from "react-icons/fa";

const navItems = [
  { to: "/voter", label: "Dashboard", icon: FaTachometerAlt, end: true },
  { to: "/voter/candidates", label: "Candidates", icon: FaListUl },
  { to: "/voter/vote", label: "Voting", icon: FaVoteYea },
  { to: "/voter/results", label: "Results", icon: FaFlagCheckered },
  { to: "/profile", label: "My Profile", icon: FaUserCircle },
];

export default function VoterLayout({ children }) {
  const { voter, voterLogout } = useAuth();
  const wallet = useWallet();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    voterLogout();
    toast.success("Logged out successfully.");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-midnight-950">
      <Sidebar
        items={navItems}
        title="VoteChain"
        subtitle="Voter Panel"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={voter}
          onLogout={handleLogout}
          wallet={wallet}
          showWallet
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children || <Outlet context={{ wallet }} />}
          </div>
        </main>
      </div>
    </div>
  );
}
