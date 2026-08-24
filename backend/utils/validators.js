/**
 * Validate Email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate Phone Number
 * Accepts 10-digit Indian mobile numbers
 */
export const isValidPhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate Voter ID
 * Minimum 5 characters
 */
export const isValidVoterId = (voterId) => {
    return typeof voterId === "string" && voterId.trim().length >= 5;
};

/**
 * Validate Name
 */
export const isValidName = (name) => {
    return typeof name === "string" && name.trim().length >= 3;
};

/**
 * Validate OTP
 * Must be exactly 6 digits
 */
export const isValidOTP = (otp) => {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
};

/**
 * Validate Password
 * Minimum 6 characters
 */
export const isValidPassword = (password) => {
    return typeof password === "string" && password.length >= 6;
};