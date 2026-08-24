const Voter = require("../models/Voter");

const OTP = require("../models/OTP");

const { createAndSendOTP, verifyOTP } = require("../services/otpService");

/**
 * @desc Send OTP
 * @route POST /api/otp/send
 */

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    // Check voter exists
    const voter = await Voter.findOne({ email });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found.",
      });
    }

    // Generate & Send OTP
    const result = await createAndSendOTP(email);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP.",
    });
  }
};

/**
 * @desc Verify OTP
 * @route POST /api/otp/verify
 */

const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // Verify OTP
    const result = await verifyOTP(email, otp);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Mark voter as verified
    const voter = await Voter.findOneAndUpdate(
      { email },
      {
        isVerified: true,
      },
      {
        new: true,
      },
    );

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found.",
      });
    }

    await OTP.deleteMany({ email });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Voter is now verified.",
      voter: {
        id: voter._id,
        name: voter.name,
        voterId: voter.voterId,
        email: voter.email,
        phone: voter.phone,
        isVerified: voter.isVerified,
        hasVoted: voter.hasVoted,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
};

/**
 * @desc Resend OTP
 * @route POST /api/otp/resend
 */

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const voter = await Voter.findOne({ email });

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found.",
      });
    }

    const result = await createAndSendOTP(email);

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP.",
    });
  }
};

// Export Controllers
module.exports = {
  sendOTP,
  verifyOTPController,
  resendOTP,
};
