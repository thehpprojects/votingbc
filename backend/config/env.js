const dotenv = require("dotenv");

const loadEnvironment = () => {
    dotenv.config();

    console.log("✅ Environment Variables Loaded");
};

module.exports = loadEnvironment;