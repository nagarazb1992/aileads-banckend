
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const FROM_EMAIL = process.env.FROM_EMAIL || `"Leads AI" <${process.env.SMTP_USER}>`;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection at startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take messages');
  }
});

function renderTemplate(
  file: string,
  variables: Record<string, string>
) {
  const templatePath = path.join(__dirname, `../emails/${file}`);
  console.log('Rendering template from:', templatePath);
  if (!fs.existsSync(templatePath)) {
    console.error('Template file does not exist:', templatePath);
    return '';
  }
  let html = fs.readFileSync(templatePath, 'utf8');

  Object.entries(variables).forEach(([key, value]) => {
    html = html.replaceAll(`{{${key}}}`, value);
  });

  return html;
}


export async function sendEmail(to: string, subject: string, body: string) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html: body,
    });
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
}



export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
) {
  const html = renderTemplate('verify-link.html', {
    VERIFY_LINK: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
    NAME: firstName || 'there'
  });

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email',
      html
    });
    return info;
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
}


export async function sendWelcomeEmail(
  email: string,
  name: string
) {
  const html = renderTemplate('welcome.html', {
    NAME: name,
    DASHBOARD_URL: `${process.env.FRONTEND_URL}/dashboard`
  });

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to LeadsForg 🚀',
      html
    });
    console.log('Welcome email sent:', info.response);
  } catch (err) {
    console.error('Error sending welcome email:', err);
    throw err;
  }
}


// Forgot Password Email
export async function sendResetPasswordEmail(
  email: string,
  token: string
) {
  const html = `
    <div style="font-family:Arial">
      <h2>Reset your password</h2>
      <p>You requested a password reset.</p>

      <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}"
         style="padding:10px 20px;background:#4f46e5;color:#fff;
                text-decoration:none;border-radius:6px">
        Reset Password
      </a>

      <p style="margin-top:20px;font-size:12px">
        This link expires in 30 minutes.
      </p>
    </div>
  `;

  console.log('Sending reset password email to:', email);
  

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your LeadsPilot password',
    html
  });
}

export async function sendCampaignEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  
  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}



