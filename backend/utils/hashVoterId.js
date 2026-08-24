const crypto = require("crypto");

/**
 * Hash Voter ID using SHA-256
 * @param {string} voterId
 * @returns {string} Hashed Voter ID
 */

const hashVoterId = (voterId) => {
    return crypto
        .createHash("sha256")
        .update(voterId)
        .digest("hex");
};


module.exports = hashVoterId;