const express = require("express");


const {
    loginAdmin,
    createAdmin,
    getAdminProfile
} = require("../controllers/adminController");


const protectAdmin = require("../middleware/authMiddleware");


const {
    validateAdminLogin
} = require("../middleware/validateMiddleware");


const router = express.Router();



/**
 * @route   POST /api/admin/create
 * @desc    Create First Admin
 * @access  Public (Remove after creating first admin)
 */

router.post(
    "/create",
    createAdmin
);



/**
 * @route   POST /api/admin/login
 * @desc    Admin Login
 * @access  Public
 */

router.post(
    "/login",
    validateAdminLogin,
    loginAdmin
);



/**
 * @route   GET /api/admin/profile
 * @desc    Get Logged-in Admin Profile
 * @access  Private
 */

router.get(
    "/profile",
    protectAdmin,
    getAdminProfile
);



module.exports = router;