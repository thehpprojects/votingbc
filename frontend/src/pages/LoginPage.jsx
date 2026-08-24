// ======================================
// VoteChain Login Page (Admin + Voter)
// ======================================

import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Input } from "../components/common/Input";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import { FaUserShield, FaUser, FaShieldAlt, FaLock, FaVoteYea } from "react-icons/fa";
import { loginAdmin, sendOTP, verifyOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { isValidEmail, isValidOTP } from "../utils/validators";

const OTP_RESEND_SECONDS = 30;

export default function LoginPage() {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "admin" ? "admin" : "voter";
  const [role, setRole] = useState(initialRole);
  const navigate = useNavigate();
  const { adminLogin, voterLogin, voter } = useAuth();

  // ---- admin state ----
  const [adminForm, setAdminForm] = useState({ email: "", password: "" });
  const [adminErrors, setAdminErrors] = useState({});
  const [adminLoading, setAdminLoading] = useState(false);

  // ---- voter state ----
  const [step, setStep] = useState(1); // 1 = email, 2 = otp
  const [voterEmail, setVoterEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [voterLoading, setVoterLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // ==================================
  // Admin Login
  // ==================================
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!isValidEmail(adminForm.email)) errors.email = "Enter a valid email";
    if (!adminForm.password) errors.password = "Password is required";
    setAdminErrors(errors);
    if (Object.keys(errors).length) return;

    setAdminLoading(true);
    try {
      const res = await loginAdmin({ email: adminForm.email, password: adminForm.password });
      adminLogin(res.data.token, res.data.admin);
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setAdminLoading(false);
    }
  };

  // ==================================
  // Voter OTP Login
  // ==================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isValidEmail(voterEmail)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setVoterLoading(true);
    try {
      const res = await sendOTP(voterEmail);
      setDevOtp(res.data?.devOtp || "");
      setOtpSent(true);
      setStep(2);
      setResendIn(OTP_RESEND_SECONDS);
      toast.success("OTP sent to your email.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setVoterLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isValidOTP(otp)) {
      toast.error("OTP must be 6 digits.");
      return;
    }
    setVoterLoading(true);
    try {
      const res = await verifyOTP(voterEmail, otp);
      toast.success("OTP verified!");

      const voterData = res.data?.voter;
      if (voterData) {
        voterLogin(voterData);
        navigate("/voter");
      } else {
        toast("No active voter session found for this email. Please register.", {
          icon: "📋",
        });
        navigate("/register");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setVoterLoading(false);
    }
  };

  const handleResend = async () => {
    setVoterLoading(true);
    try {
      const res = await sendOTP(voterEmail);
      setDevOtp(res.data?.devOtp || "");
      setResendIn(OTP_RESEND_SECONDS);
      toast.success("OTP resent.");
    } catch (error) {
      toast.error("Failed to resend OTP.");
    } finally {
      setVoterLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 shadow-2xl md:grid-cols-2 dark:border-slate-800">
        {/* Left panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-midnight-950 p-10 md:flex">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-violet-600/25 blur-[100px]" />
          <div className="relative">
            <Logo textClassName="text-white" />
            <h2 className="mt-8 text-2xl font-black leading-tight text-white">
              {role === "admin" ? "Admin Access" : "Voter Sign-In"}
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-brand-600 to-violet-600" />
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {role === "admin"
                ? "Manage candidates, control the election lifecycle and monitor results from your dashboard."
                : "Sign in with your registered email. A one-time password will verify your identity."}
            </p>
          </div>
          <div className="relative space-y-3 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <FaShieldAlt className="h-4 w-4 text-emerald-400" /> Verified by OTP
            </p>
            <p className="flex items-center gap-2">
              <FaLock className="h-4 w-4 text-emerald-400" /> Secured with JWT (admin)
            </p>
            <p className="flex items-center gap-2">
              <FaVoteYea className="h-4 w-4 text-emerald-400" /> Votes recorded on Polygon Amoy
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white p-8 sm:p-10 dark:bg-midnight-900">
          {/* Role tabs */}
          <div className="mb-8 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-midnight-850">
            {[
              { key: "voter", label: "Voter", icon: FaUser },
              { key: "admin", label: "Admin", icon: FaUserShield },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => {
                  setRole(r.key);
                  setStep(1);
                  setOtp("");
                }}
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition ${
                  role === r.key
                    ? "bg-white text-brand-700 shadow-sm dark:bg-midnight-800 dark:text-brand-300"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <r.icon className="h-4 w-4" /> {r.label}
              </button>
            ))}
          </div>

          {role === "admin" ? (
            /* ---------- ADMIN FORM ---------- */
            <form onSubmit={handleAdminLogin} noValidate>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Login</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Use your administrator credentials.
              </p>

              <div className="mt-6 space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@example.com"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  error={adminErrors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  error={adminErrors.password}
                />
              </div>

              <Button type="submit" className="mt-6 w-full" size="lg" loading={adminLoading}>
                Sign In as Admin
              </Button>
              <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
                First time? Create the admin account via the backend setup route.
              </p>
            </form>
          ) : (
            /* ---------- VOTER OTP FORM ---------- */
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Voter Sign In</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {step === 1
                  ? "Enter your registered email to receive an OTP."
                  : `Enter the 6-digit code sent to ${voterEmail}.`}
              </p>

              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="mt-6 space-y-4" noValidate>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    value={voterEmail}
                    onChange={(e) => setVoterEmail(e.target.value)}
                  />
                  <Button type="submit" className="w-full" size="lg" loading={voterLoading}>
                    Send OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4" noValidate>
                  {devOtp && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                      <p className="font-bold text-amber-800 dark:text-amber-300">Dev mode — your OTP:</p>
                      <p className="mt-1 font-mono text-2xl font-black tracking-widest text-amber-700 dark:text-amber-400">
                        {devOtp}
                      </p>
                    </div>
                  )}
                  <Input
                    label="One-Time Password"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <Button type="submit" className="w-full" size="lg" loading={voterLoading}>
                    Verify & Sign In
                  </Button>

                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                    >
                      ← Change email
                    </button>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendIn > 0 || voterLoading}
                      className="font-semibold text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 dark:text-brand-400"
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}

              {otpSent && !otp && (
                <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
                  OTP sent! Check your inbox and spam folder. It expires in 5 minutes.
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                New voter?{" "}
                <Link to="/register" className="font-bold text-brand-600 hover:underline dark:text-brand-400">
                  Register here
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}