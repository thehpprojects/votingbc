const OTP = require("../models/OTP");
const generateOTP = require("../utils/generateOTP");
const sendOTPEmail = require("./emailService");

const createAndSendOTP = async (email) => {
  try {
    const otp = generateOTP();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.deleteMany({ email });

    const newOTP = new OTP({
      email,
      otp,
      expiresAt,
    });

    await newOTP.save();

    // Send OTP to the user's email
    await sendOTPEmail(email, otp);

    return {
      success: true,
      message: "OTP sent successfully.",
    };
  } catch (error) {
    console.error("OTP ERROR:", error);

    return {
      success: false,
      message: "Failed to send OTP.",
    };
  }
};

/**
 * Verify OTP
 * @param {string} email
 * @param {string} enteredOTP
 */

const verifyOTP = async (email, enteredOTP) => {
  try {
    const otpData = await OTP.findOne({ email });

    if (!otpData) {
      return {
        success: false,
        message: "OTP not found.",
      };
    }

    // Check Expiry
    if (otpData.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpData._id });

      return {
        success: false,
        message: "OTP has expired.",
      };
    }

    // Check OTP
    if (otpData.otp !== enteredOTP) {
      return {
        success: false,
        message: "Invalid OTP.",
      };
    }

    // Mark as Verified
    otpData.isVerified = true;

    await otpData.save();

    return {
      success: true,
      message: "OTP verified successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "OTP verification failed.",
    };
  }
};

module.exports = {
  createAndSendOTP,
  verifyOTP,
};
