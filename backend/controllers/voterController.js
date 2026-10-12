const Voter = require("../models/Voter");

const { createAndSendOTP } = require("../services/otpService");

const hashVoterId = require("../utils/hashVoterId");

/**
 * @desc Register New Voter
 * @route POST /api/voter/register
 */

const registerVoter = async (req, res) => {
  try {
    const { name, voterId, email, phone } = req.body;

    if (!name || !voterId || (!email && !phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }
    const normalizedVoterId = voterId.trim().toUpperCase();
    const normalizedEmail = email ? email.trim().toLowerCase() : "";

    const voterIdExists = await Voter.findOne({
      voterId: normalizedVoterId,
    });

    if (voterIdExists) {
      return res.status(400).json({
        success: false,
        message: "Voter ID already registered.",
      });
    }

    if (normalizedEmail) {
      const emailExists = await Voter.findOne({
        email: normalizedEmail,
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered with another Voter ID.",
        });
      }
    }

    const hashedVoterId = hashVoterId(voterId);

    const voter = await Voter.create({
      name,
      voterId: normalizedVoterId,
      hashedVoterId: hashVoterId(normalizedVoterId),
      email: normalizedEmail,
      phone,
      isVerified: false,
      hasVoted: false,
    });

    if (email) {
      await createAndSendOTP(email);
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent.",
      voterId: voter._id,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Registration Failed.",
    });
  }
};

/**
 * @desc Get Verification Status
 * @route GET /api/voter/status/:id
 */
const getVerificationStatus = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found.",
      });
    }

    res.status(200).json({
      success: true,
      verified: voter.isVerified,

      // Voter details for Admin lookup
      voter: {
        registrationId: voter._id,
        name: voter.name,
        voterId: voter.voterId,
        email: voter.email,
        phone: voter.phone,
        createdAt: voter.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
/**
 * @desc Check Voting Status
 * @route GET /api/voter/voted/:id
 */

const getVotingStatus = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found.",
      });
    }

    res.status(200).json({
      success: true,
      hasVoted: voter.hasVoted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc Mark Voter as Voted
 * @route PUT /api/voter/vote/:id
 */

const markAsVoted = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);

    if (!voter) {
      return res.status(404).json({
        success: false,
        message: "Voter not found.",
      });
    }

    if (!voter.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Voter is not OTP verified.",
      });
    }

    if (voter.hasVoted) {
      return res.status(400).json({
        success: false,
        message: "Voter has already voted.",
      });
    }

    voter.hasVoted = true;

    await voter.save();

    res.status(200).json({
      success: true,
      message: "Voting status updated successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Export Controllers

module.exports = {
  registerVoter,
  getVerificationStatus,
  getVotingStatus,
  markAsVoted,
};
