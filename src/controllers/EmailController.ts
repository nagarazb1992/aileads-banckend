import { EmailAccount } from "../models/EmailAccount.js";
import { Membership } from "../models/index.js";
import { encrypt } from "../utils/crypto.js";


export async function connectSMTP(req: any, res: any) {
  const {
    email,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword,
    dailyLimit
  } = req.body;

  const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;

  const account = await EmailAccount.create({
    org_id: orgId,
    user_id: req.user.userId,
    provider: 'SMTP',
    email,
    smtp_host: smtpHost,
    smtp_port: smtpPort,
    smtp_user: smtpUser,
    smtp_password_encrypted: encrypt(smtpPassword),
    daily_limit: dailyLimit || 50
  });

  res.json({ success: true, account });
}

export async function listEmailAccounts(req: any, res: any) {
  const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;
  const accounts = await EmailAccount.findAll({
    where: {
      org_id: orgId,
      is_active: true
    },
    attributes: [
      'id',
      'email',
      'provider',
      'daily_limit',
      'sent_today'
    ]
  });

  res.json(accounts);
}

// Get a single EmailAccount by id
export async function getEmailAccount(req: any, res: any) {
  const { id } = req.params;
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue("organization_id") : undefined;
  const account = await EmailAccount.findOne({
    where: { id, org_id: orgId }
  });
  if (!account) {
    return res.status(404).json({ message: "Email account not found" });
  }
  res.json(account);
}

// Update an EmailAccount by id
export async function updateEmailAccount(req: any, res: any) {
  const { id } = req.params;
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue("organization_id") : undefined;
  const account = await EmailAccount.findOne({
    where: { id, org_id: orgId }
  });
  if (!account) {
    return res.status(404).json({ message: "Email account not found" });
  }
  // Only update allowed fields
  const {
    email,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPassword,
    dailyLimit,
    isActive
  } = req.body;
  if (email !== undefined) account.email = email;
  if (smtpHost !== undefined) account.smtp_host = smtpHost;
  if (smtpPort !== undefined) account.smtp_port = smtpPort;
  if (smtpUser !== undefined) account.smtp_user = smtpUser;
  if (smtpPassword !== undefined) account.smtp_password_encrypted = encrypt(smtpPassword);
  if (dailyLimit !== undefined) account.daily_limit = dailyLimit;
  if (isActive !== undefined) account.is_active = isActive;
  await account.save();
  res.json({ success: true, account });
}

// Delete an EmailAccount by id
export async function deleteEmailAccount(req: any, res: any) {
  const { id } = req.params;
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue("organization_id") : undefined;
  const account = await EmailAccount.findOne({
    where: { id, org_id: orgId }
  });
  if (!account) {
    return res.status(404).json({ message: "Email account not found" });
  }
  await account.destroy();
  res.json({ success: true });
}
