// ======================================
// Form Validation Helpers
// ======================================

/** Validate a full name (min 3 chars). */
export const isValidName = (name) =>
  typeof name === "string" && name.trim().length >= 3;

/** Validate an email address. */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");

/** Validate a 6-digit OTP. */
export const isValidOTP = (otp) => /^\d{6}$/.test(otp || "");

/** Validate voter id (alphanumeric, 6-20 chars). */ /** Validate voter id (minimum 8 chars, at least one letter and one number). */

export const isValidVoterId = (voterId) =>
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(voterId || "");

/** Validate phone number (10-15 digits, optional + prefix). */
export const isValidPhone = (phone) =>
  phone === "" || /^\+?[0-9]{10,15}$/.test(phone || "");

/** Validate password (min 6 chars). */
export const isValidPassword = (password) =>
  typeof password === "string" && password.length >= 6;

/** Validate a non-empty required field. */
export const isRequired = (value) =>
  typeof value === "string" && value.trim().length > 0;

/** Validate an IPFS CID / content identifier (non-empty, basic shape). */
export const isValidCid = (cid) =>
  typeof cid === "string" && cid.trim().length >= 3;
