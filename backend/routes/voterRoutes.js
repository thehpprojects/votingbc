const express = require("express");

const {
    registerVoter,
    getVerificationStatus,
    getVotingStatus,
    markAsVoted
} = require("../controllers/voterController");

const {
    validateVoterRegistration
} = require("../middleware/validateMiddleware");

const router = express.Router();

router.post(
    "/register",
    validateVoterRegistration,
    registerVoter
);

/**
 * @route   GET /api/voter/status/:id
 * @desc    Get voter verification status
 * @access  Public
 */
router.get(
    "/status/:id",
    getVerificationStatus
);

/**
 * @route   GET /api/voter/voted/:id
 * @desc    Check if voter has already voted
 * @access  Public
 */
router.get(
    "/voted/:id",
    getVotingStatus
);

/**
 * @route   PUT /api/voter/vote/:id
 * @desc    Mark voter as voted
 * @access  Public
 */
router.put(
    "/vote/:id",
    markAsVoted
);

module.exports = router;