const bcrypt = require("bcrypt");

const Admin = require("../models/Admin");

const generateToken = require("../utils/jwtToken");


/**
 * @desc Admin Login
 * @route POST /api/admin/login
 * @access Public
 */

const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body;


        // Validate Input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required."
            });
        }


        // Check Admin Exists
        const admin = await Admin.findOne({ email });


        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password."
            });
        }


        // Compare Password
        const isMatch = await bcrypt.compare(password, admin.password);


        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Email or Password."
            });
        }


        // Generate JWT Token
        const token = generateToken(admin._id);


        res.status(200).json({
            success: true,
            message: "Login Successful",
            token,

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};




/**
 * @desc Get Admin Profile
 * @route GET /api/admin/profile
 * @access Private
 */

const getAdminProfile = async (req, res) => {

    try {

        const admin = await Admin
            .findById(req.admin._id)
            .select("-password");


        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found."
            });
        }


        res.status(200).json({
            success: true,
            admin,
        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};





/**
 * @desc Create Admin (Run Once)
 * @route POST /api/admin/create
 * @access Public
 */

const createAdmin = async (req, res) => {

    try {

        const { name, email, password } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }


        const exists = await Admin.findOne({ email });


        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists."
            });
        }


        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);


        const admin = await Admin.create({
            name,
            email,
            password: hashedPassword,
        });


        res.status(201).json({
            success: true,
            message: "Admin created successfully.",

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });


    } catch (error) {

        console.error(error);


        res.status(500).json({
            success: false,
            message: "Server Error"
        });

    }
};



// Export Controllers
module.exports = {
    loginAdmin,
    getAdminProfile,
    createAdmin
};