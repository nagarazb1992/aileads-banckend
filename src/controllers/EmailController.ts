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
    dailyLimit,
    imapHost,
    imapPort,
    imapSecure,
    imapUser,
    imapPassword,
    imapLastUid,
    imapLastCheckedAt
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
    daily_limit: dailyLimit || 50,
    imap_host: imapHost,
    imap_port: imapPort,
    imap_secure: imapSecure,
    imap_user: imapUser,
    imap_password_encrypted: imapPassword ? encrypt(imapPassword) : '',
    imap_last_uid: imapLastUid,
    imap_last_checked_at: imapLastCheckedAt
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
      'sent_today',
      'imap_host',
      'imap_port',
      'imap_secure',
      'imap_user',
      'imap_password_encrypted',
      'imap_last_uid',
      'imap_last_checked_at'
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
    where: { id, org_id: orgId },
    attributes: [
      'id',
      'email',
      'provider',
      'daily_limit',
      'sent_today',
      'imap_host',
      'imap_port',
      'imap_secure',
      'imap_user',
      'imap_password_encrypted',
      'imap_last_uid',
      'imap_last_checked_at'
    ]
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
    isActive,
    imapHost,
    imapPort,
    imapSecure,
    imapUser,
    imapPassword,
    imapLastUid,
    imapLastCheckedAt
  } = req.body;
  account.set({
    ...(email !== undefined && { email }),
    ...(smtpHost !== undefined && { smtp_host: smtpHost }),
    ...(smtpPort !== undefined && { smtp_port: smtpPort }),
    ...(smtpUser !== undefined && { smtp_user: smtpUser }),
    ...(smtpPassword !== undefined && { smtp_password_encrypted: encrypt(smtpPassword) }),
    ...(dailyLimit !== undefined && { daily_limit: dailyLimit }),
    ...(isActive !== undefined && { is_active: isActive }),
    ...(imapHost !== undefined && { imap_host: imapHost }),
    ...(imapPort !== undefined && { imap_port: imapPort }),
    ...(imapSecure !== undefined && { imap_secure: imapSecure }),
    ...(imapUser !== undefined && { imap_user: imapUser }),
    ...(imapPassword !== undefined && { imap_password_encrypted: encrypt(imapPassword) }),
    ...(imapLastUid !== undefined && { imap_last_uid: imapLastUid }),
    ...(imapLastCheckedAt !== undefined && { imap_last_checked_at: imapLastCheckedAt })
  });
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
