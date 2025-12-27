import nodemailer from 'nodemailer';
import { decrypt } from '../utils/crypto.js';

export async function sendCampaignEmail({
  account,
  to,
  subject,
  html
}) {
  if (account.sent_today >= account.daily_limit) {
    throw new Error('Daily send limit reached');
  }

  const transporter = nodemailer.createTransport({
    host: account.smtp_host,
    port: account.smtp_port,
    auth: {
      user: account.smtp_user,
      pass: decrypt(account.smtp_password_encrypted)
    }
  });

  await transporter.sendMail({
    from: account.email,
    to,
    subject,
    html
  });

  await account.increment('sent_today');
}
