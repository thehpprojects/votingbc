const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");


/**
 * Middleware to Protect Admin Routes
 */

const protectAdmin = async (req, res, next) => {
    try {

        let token;


        // Check Authorization Header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }


        // No Token Found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided."
            });
        }


        // Verify JWT Token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // Find Admin by ID
        const admin = await Admin
            .findById(decoded.id)
            .select("-password");


        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found."
            });
        }


        // Attach Admin Data
        req.admin = admin;


        next();


    } catch (error) {

        console.error(error);


        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
};



module.exports = protectAdmin;