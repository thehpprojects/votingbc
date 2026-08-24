/**
 * Validate Voter Registration
 */

const validateVoterRegistration = (req, res, next) => {

    const { name, voterId, email } = req.body;


    // Check Required Fields
    if (!name || !voterId || !email) {
        return res.status(400).json({
            success: false,
            message: "Name, Voter ID and Email are required"
        });
    }


    // Name Validation
    if (name.trim().length < 3) {
        return res.status(400).json({
            success: false,
            message: "Name must contain at least 3 characters"
        });
    }


    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }


    next();
};


/**
 * Validate OTP Request
 */

const validateOTP = (req, res, next) => {

    const { email, otp } = req.body;


    if (!email || !otp) {
        return res.status(400).json({
            success: false,
            message: "Email and OTP are required"
        });
    }


    if (otp.length !== 6) {
        return res.status(400).json({
            success: false,
            message: "OTP must be 6 digits"
        });
    }


    next();
};


/**
 * Validate Admin Login
 */

const validateAdminLogin = (req, res, next) => {

    const { email, password } = req.body;


    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }


    next();
};



module.exports = {
    validateVoterRegistration,
    validateOTP,
    validateAdminLogin
};