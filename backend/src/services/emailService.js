import axios from 'axios';

/**
 * Send Password Reset OTP Email using Brevo API (v3)
 * This method uses HTTPS, completely bypassing SMTP/networking issues on Render.
 * @param {string} to - User email
 * @param {string} otp - 6-digit code
 * @param {string} name - User's name
 */
export const sendResetPasswordEmail = async (to, otp, name) => {
  const BREVO_API_KEY = (process.env.BREVO_API_KEY || '').trim();
  const SENDER_EMAIL = (process.env.SENDER_EMAIL || 'saravanan619.m@gmail.com').trim();
  const SENDER_NAME = 'ShrinQE Auth';

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY is missing in environment variables');
    throw new Error('Email service configuration missing');
  }

  const data = {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: [{ email: to, name: name }],
    subject: 'Password Reset OTP - ShrinQE',
    htmlContent: `
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
          Sent using Brevo API from ShrinQE URL Shortener <br>
          © 2024 ShrinQE Team
        </p>
      </div>
    `,
  };

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', data, {
      headers: {
        'api-key': BREVO_API_KEY,
        'x-sib-api-key': BREVO_API_KEY, // Backup header
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log('Email sent successfully via Brevo:', response.data.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email via Brevo:', error.response?.data || error.message);
    throw new Error('Failed to send verification email');
  }
};
