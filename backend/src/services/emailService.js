import nodemailer from 'nodemailer';
import dns from 'dns';

// Force IPv4 preference globally
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * Configure Nodemailer with Brevo SMTP (Port 2525)
 * This configuration is proven to work in the Savory Bites project on Render.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 2525,
  secure: false, // Port 2525 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Your Brevo SMTP key (xsmtpsib-...)
  },
  family: 4, // Force IPv4
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 20000,
  tls: {
    // This allows connecting even if there are certificate routing issues on cloud networks
    rejectUnauthorized: false
  }
});

/**
 * Send Password Reset OTP Email
 * @param {string} to - User email
 * @param {string} otp - 6-digit code
 * @param {string} name - User's name
 */
export const sendResetPasswordEmail = async (to, otp, name) => {
  const fromEmail = process.env.SENDER_EMAIL || process.env.SMTP_USER;
  
  const mailOptions = {
    from: `"ShrinQE Auth" <${fromEmail}>`,
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
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Brevo SMTP:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email via Brevo SMTP:', error);
    throw new Error('Failed to send verification email');
  }
};
