const express = require("express");
const cors = require("cors");

// ==========================
// Load Environment Variables
// ==========================
const loadEnvironment = require("./config/env");
loadEnvironment();

// ==========================
// Database Connection
// ==========================
const connectDB = require("./config/database");

// ==========================
// Routes
// ==========================
const voterRoutes = require("./routes/voterRoutes");
const otpRoutes = require("./routes/otpRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ==========================
// Middleware
// ==========================
const errorHandler = require("./middleware/errorMiddleware");

// ==========================
// Initialize App
// ==========================
const app = express();

// ==========================
// Connect Database
// ==========================
connectDB();

// ==========================
// Global Middleware
// ==========================
app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

// ==========================
// Home Route
// ==========================
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Blockchain Voting Backend API Running Successfully 🚀",
    });
});

// ==========================
// API Routes
// ==========================
app.use("/api/voter", voterRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/admin", adminRoutes);

// ==========================
// Health Check
// ==========================
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        environment: process.env.NODE_ENV || "development",
        time: new Date(),
    });
});

// ==========================
// 404 Route
// ==========================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found",
    });
});

// ==========================
// Global Error Handler
// ==========================
app.use(errorHandler);

// ==========================
// Start Server
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("=====================================");
    console.log("🚀 Blockchain Voting Backend Started");
    console.log(`🌐 Server : http://localhost:${PORT}`);
    console.log(`📦 Environment : ${process.env.NODE_ENV || "development"}`);
    console.log("=====================================");
});