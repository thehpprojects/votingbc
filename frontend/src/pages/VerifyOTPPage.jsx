// ======================================
// VoteChain OTP Verification Page
// ======================================

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import { FaEnvelope } from "react-icons/fa";
import { verifyOTP, sendOTP } from "../services/api";
import { useAuth } from "../context/AuthContext";

const RESEND_SECONDS = 30;

export default function VerifyOTPPage() {
  const [params] = useSearchParams();
  const email = params.get("email") || "";
  const devOtp = params.get("devOtp") || "";
  const navigate = useNavigate();
  const { voter, voterLogin, refreshVoterStatus } = useAuth();

  const [otp, setOtp] = useState(() => {
    const digits = devOtp.split("");
    return Array.from({ length: 6 }, (_, i) => digits[i] || "");
  });
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const inputsRef = useRef([]);

  // Auto-resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const otpValue = otp.join("");

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    // auto-advance to next box
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await verifyOTP(email, otpValue);
      toast.success("OTP verified! Your identity is confirmed.");

      // Update local voter session as verified
      if (voter) {
        voterLogin({ ...voter, isVerified: true });
        await refreshVoterStatus();
      }
      navigate("/voter");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Check the OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      await sendOTP(email);
      setResendIn(RESEND_SECONDS);
      toast.success("New OTP sent!");
    } catch (error) {
      toast.error("Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Missing email address</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          We can't verify OTP without a registered email.
        </p>
        <Link to="/register" className="mt-6 inline-block font-bold text-brand-600 hover:underline dark:text-brand-400">
          Go to Registration
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-16">
      <div className="w-full animate-fade-in rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-midnight-900">
        <div className="relative mx-auto inline-flex">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 shadow-glow">
            <FaEnvelope className="h-7 w-7 text-white" />
          </div>
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-midnight-900">
            ✓
          </span>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Identity</h1>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          OTP sent to
          <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Enter the 6-digit code. It expires in 5 minutes.</p>

        {devOtp && (
          <div className="mt-4 animate-fade-in rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="font-bold text-amber-800 dark:text-amber-300">Dev mode — your OTP:</p>
            <p className="mt-1 font-mono text-2xl font-black tracking-widest text-amber-700 dark:text-amber-400">
              {devOtp}
            </p>
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-500">
              Email delivery is disabled, so it's shown here instead.
            </p>
          </div>
        )}

        <form onSubmit={handleVerify} className="mt-7">
          {/* OTP boxes */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-12 w-10 rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 sm:h-14 sm:w-12 dark:border-slate-700 dark:bg-midnight-850 dark:text-white dark:focus:border-brand-400"
              />
            ))}
          </div>

          <Button type="submit" size="lg" className="mt-7 w-full" loading={loading}>
            Verify OTP
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs">
          <Link to="/login?role=voter" className="font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            ← Back to login
          </Link>
          <button
            onClick={handleResend}
            disabled={resendIn > 0 || loading}
            className="font-semibold text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 dark:text-brand-400 dark:disabled:text-slate-500"
          >
            {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
}