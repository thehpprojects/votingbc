const jwt = require("jsonwebtoken");


/**
 * Generate JWT Token for Admin
 * @param {string} adminId
 * @returns {string} JWT Token
 */

const generateToken = (adminId) => {

    return jwt.sign(
        {
            id: adminId
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

};


module.exports = generateToken;