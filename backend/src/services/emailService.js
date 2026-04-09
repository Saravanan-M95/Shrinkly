import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node.js to prefer IPv4 over IPv6. 
// This is the definitive fix for ENETUNREACH errors on Render.
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Configure Nodemailer with Gmail SMTP
 * For Gmail, users MUST provide an "App Password"
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  // Force IPv4 at the socket level
  family: 4, 
});

// Validate credentials on startup
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn('WARNING: SMTP_USER or SMTP_PASS is missing. Email service will not work.');
}

/**
 * Send Password Reset OTP Email
 * @param {string} to - User email
 * @param {string} otp - 6-digit code
 * @param {string} name - User's name
 */
export const sendResetPasswordEmail = async (to, otp, name) => {
  const mailOptions = {
    from: `"ShrinQE Auth" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Password Reset OTP - ShrinQE',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #7C3AED; text-align: center;">ShrinQE</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Use the verification code below to proceed:</p>
        <div style="background-color: #f7f3ff; font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 10px; padding: 20px; margin: 20px 0; color: #7C3AED; border-radius: 8px;">
          ${otp}
        </div>
        <p>This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          Sent from ShrinQE URL Shortener <br>
          © 2024 ShrinQE Team
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
};
