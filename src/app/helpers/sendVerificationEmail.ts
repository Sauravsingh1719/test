import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<{ success: boolean }> {
  try {
    const currentYear = new Date().getFullYear();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Testify - Verify Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">Testify</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Student Learning Portal</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Account</h2>
            <p style="color: #666; line-height: 1.6;">
              Hello <strong>${username}</strong>,
            </p>
            <p style="color: #666; line-height: 1.6;">
              Thank you for joining Testify! Use the verification code below to activate your account:
            </p>
            
            <div style="background: white; padding: 20px; margin: 25px 0; text-align: center; border-radius: 8px; border: 2px dashed #667eea;">
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea;">
                ${verifyCode}
              </div>
            </div>
            
            <p style="color: #666; line-height: 1.6;">
              This code will expire in <strong>1 hour</strong> for security reasons.
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Note:</strong> If you didn't create an account with Testify, please ignore this email.
              </p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
            <p style="margin: 0;">&copy; ${currentYear} Testify. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false };
  }
}
