// ======================================
// VoteChain Voter Registration Page
// ======================================

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Input } from "../components/common/Input";
import Button from "../components/common/Button";
import Logo from "../components/common/Logo";
import { FaShieldAlt, FaEnvelope, FaVoteYea, FaLink, FaLock } from "react-icons/fa";
import { registerVoter } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  isValidEmail,
  isValidName,
  isValidVoterId,
  isValidPhone,
} from "../utils/validators";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { voterLogin } = useAuth();
  const [form, setForm] = useState({
    name: "",
    voterId: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (!isValidName(form.name)) errs.name = "Name must be at least 3 characters";
    if (!isValidVoterId(form.voterId))
      errs.voterId = "Voter ID must be 4-20 letters, numbers or dashes";
    if (!isValidEmail(form.email)) errs.email = "Enter a valid email address";
    if (form.phone && !isValidPhone(form.phone))
      errs.phone = "Enter a valid phone number (10-15 digits)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await registerVoter(form);
      const voterId = res.data.voterId;
      const devOtp = res.data.devOtp;

      // Start a local voter session immediately so OTP verification can complete it
      voterLogin({
        id: voterId,
        name: form.name.trim(),
        voterIdNumber: form.voterId.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        isVerified: false,
        hasVoted: false,
      });

      toast.success("Registration successful! OTP sent to your email.");
      navigate(
        `/verify-otp?email=${encodeURIComponent(form.email)}${
          devOtp ? `&devOtp=${devOtp}` : ""
        }`
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-2 dark:border-slate-800">
        {/* Info side */}
        <div className="relative overflow-hidden bg-midnight-950 p-10">
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-brand-600/30 blur-[110px]" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-600/25 blur-[110px]" />
          <div className="relative">
            <Logo textClassName="text-white" />
            <h2 className="mt-8 text-2xl font-black leading-tight text-white">
              Become a Verified Voter
            </h2>
            <div className="mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-brand-600 to-violet-600" />
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Complete the form to register. We'll send a 6-digit OTP to your email
              to verify your identity. Only verified voters can cast on-chain votes.
            </p>

            <div className="mt-8 space-y-5">
              {[
                { icon: FaShieldAlt, text: "Your Voter ID is stored hashed — never exposed in plain text" },
                { icon: FaEnvelope, text: "OTP expires in 5 minutes and can be resent anytime" },
                { icon: FaLink, text: "After verification, connect MetaMask and vote on-chain" },
                { icon: FaLock, text: "One wallet — one vote, enforced by the smart contract" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-300">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="bg-white p-8 sm:p-10 dark:bg-midnight-900">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Voter Registration</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            All fields marked * are required.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <Input
              label="Full Name *"
              name="name"
              placeholder="e.g. Ananya Sharma"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="Voter ID *"
              name="voterId"
              placeholder="e.g. ABC1234567"
              value={form.voterId}
              onChange={handleChange}
              error={errors.voterId}
              helper="Must be unique. Stored hashed for security."
            />
            <Input
              label="Email Address *"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Phone Number (optional)"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Register & Send OTP
            </Button>

            <p className="pt-2 text-center text-sm text-slate-500 dark:text-slate-400">
              Already registered?{" "}
              <Link to="/login?role=voter" className="font-bold text-brand-600 hover:underline dark:text-brand-400">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}