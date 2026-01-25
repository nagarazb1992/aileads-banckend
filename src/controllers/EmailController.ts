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

  console.log('Connecting SMTP with:', req.body);

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

// Update an EmailAccount by i
export async function updateEmailAccount(req: any, res: any) {
  try {
    const { id } = req.params;

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const membership = await Membership.findOne({
      where: { user_id: req.user.userId }
    });

    if (!membership) {
      return res.status(403).json({ message: "Organization not found" });
    }

    const orgId = membership.getDataValue("organization_id");

    const account = await EmailAccount.findOne({
      where: { id, org_id: orgId }
    });

    if (!account) {
      return res.status(404).json({ message: "Email account not found" });
    }

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

    const updatePayload: any = {
      ...(email !== undefined && { email }),
      ...(smtpHost !== undefined && { smtp_host: smtpHost }),
      ...(smtpPort !== undefined && { smtp_port: smtpPort }),
      ...(smtpUser !== undefined && { smtp_user: smtpUser }),
      ...(dailyLimit !== undefined && { daily_limit: dailyLimit }),
      ...(isActive !== undefined && { is_active: isActive }),
      ...(imapHost !== undefined && { imap_host: imapHost }),
      ...(imapPort !== undefined && { imap_port: imapPort }),
      ...(imapSecure !== undefined && { imap_secure: imapSecure }),
      ...(imapUser !== undefined && { imap_user: imapUser }),
    };

    // Only set imap_last_uid if it's a valid number
    if (imapLastUid !== undefined && imapLastUid !== null && imapLastUid !== "" && !isNaN(Number(imapLastUid))) {
      updatePayload.imap_last_uid = Number(imapLastUid);
    }

    // Only set imap_last_checked_at if it's a valid date
    if (imapLastCheckedAt !== undefined && imapLastCheckedAt !== null && imapLastCheckedAt !== "") {
      const date = new Date(imapLastCheckedAt);
      if (!isNaN(date.getTime())) {
        updatePayload.imap_last_checked_at = date;
      }
    }

    // Encrypt only if password is provided & non-empty
    if (smtpPassword) {
      updatePayload.smtp_password_encrypted = encrypt(smtpPassword);
    }

    if (imapPassword) {
      updatePayload.imap_password_encrypted = encrypt(imapPassword);
    }

    account.set(updatePayload);
    await account.save();

    // ❌ Never expose encrypted secrets
    const safeAccount = account.get({ plain: true });
    delete safeAccount.smtp_password_encrypted;
    delete safeAccount.imap_password_encrypted;

    return res.json({
      success: true,
      account: safeAccount
    });
  } catch (error) {
    console.error("updateEmailAccount error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
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
