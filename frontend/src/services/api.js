// ======================================
// Backend API Client (Axios)
// ======================================

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Shared axios instance for all backend requests.
 */
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach admin JWT token when available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("voting_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ======================================
// Admin APIs
// ======================================

/** POST /api/admin/create — create the first admin (setup only) */
export const createAdmin = (data) => api.post("/api/admin/create", data);

/** POST /api/admin/login — admin login, returns JWT token */
export const loginAdmin = (data) => api.post("/api/admin/login", data);

/** GET /api/admin/profile — logged-in admin profile (private) */
export const getAdminProfile = () => api.get("/api/admin/profile");

// ======================================
// Voter APIs
// ======================================

/** POST /api/voter/register — register a new voter, returns voterId (Mongo id) */
export const registerVoter = (data) => api.post("/api/voter/register", data);

/** GET /api/voter/status/:id — voter verification status */
export const getVoterVerificationStatus = (voterId) =>
  api.get(`/api/voter/status/${voterId}`);

/** GET /api/voter/voted/:id — whether the voter has already voted */
export const getVoterVotingStatus = (voterId) =>
  api.get(`/api/voter/voted/${voterId}`);

/** PUT /api/voter/vote/:id — mark voter as voted after on-chain tx */
export const markVoterAsVoted = (voterId) =>
  api.put(`/api/voter/vote/${voterId}`);

// ======================================
// OTP APIs
// ======================================

/** POST /api/otp/send — send OTP to the voter email */
export const sendOTP = (email) => api.post("/api/otp/send", { email });

/** POST /api/otp/verify — verify OTP, marks voter verified */
export const verifyOTP = (email, otp) =>
  api.post("/api/otp/verify", { email, otp });

/** POST /api/otp/resend — resend OTP */
export const resendOTP = (email) => api.post("/api/otp/resend", { email });

export default api;
