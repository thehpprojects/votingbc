const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"VoteChain" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: "Your VoteChain OTP",

      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>VoteChain</h2>

          <p>Your One-Time Password is:</p>

          <h1 style="color:#2563eb; letter-spacing:8px;">
            ${otp}
          </h1>

          <p>This OTP is valid for <b>5 minutes</b>.</p>

          <p>If you did not request this OTP, please ignore this email.</p>

          <hr>

          <p>VoteChain Blockchain Voting System</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("=================================");
    console.log("✅ OTP EMAIL SENT");
    console.log("Recipient:", email);
    console.log("Message ID:", info.messageId);
    console.log("Accepted:", info.accepted);
    console.log("Rejected:", info.rejected);
    console.log("=================================");

    return true;
  } catch (error) {
    console.error("=================================");
    console.error("❌ OTP EMAIL FAILED");
    console.error(error);
    console.error("=================================");

    throw error;
  }
};

module.exports = sendOTPEmail;
