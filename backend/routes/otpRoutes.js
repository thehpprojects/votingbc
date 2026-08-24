const express = require("express");

const {
    sendOTP,
    verifyOTPController,
    resendOTP
} = require("../controllers/otpController");


const {
    validateOTP
} = require("../middleware/validateMiddleware");


const router = express.Router();


/**
 * @route   POST /api/otp/send
 * @desc    Send OTP to voter email
 * @access  Public
 */

router.post(
    "/send",
    sendOTP
);


/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 * @access  Public
 */

router.post(
    "/verify",
    validateOTP,
    verifyOTPController
);


/**
 * @route   POST /api/otp/resend
 * @desc    Resend OTP
 * @access  Public
 */

router.post(
    "/resend",
    resendOTP
);


module.exports = router;