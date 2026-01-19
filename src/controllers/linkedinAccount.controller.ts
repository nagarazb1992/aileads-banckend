// controllers/linkedin.controller.ts
import type { Request, Response } from 'express';
import { LinkedinAccount } from '../models/LinkedinAccount.js';
import { encrypt } from '../utils/crypto.js';
import { validateLinkedinCookie } from '../services/linkedinValidate.service.js';
import { Membership } from '../models/membership.model.js';

export async function connectLinkedin(
  req: any & { user?: any },
  res: any
) {
  try {
    const { sessionCookie } = req.body;
    const userId = req.user.userId;

    const membership = await Membership.findOne({
      where: { user_id: userId }
    });

    const orgId = membership?.getDataValue('organization_id');

    if (!sessionCookie) {
      return res.status(400).json({
        message: 'sessionCookie is required'
      });
    }

    // 1️⃣ Validate LinkedIn session
    const validation = await validateLinkedinCookie(sessionCookie);

    console.log('[LinkedIn Connect] Validation result:', validation);

    if (!validation.valid) {
      return res.status(400).json({
        message: validation.error || 'Invalid LinkedIn session'
      });
    }

    // 2️⃣ Ensure profileUrl is present
    if (!('profileUrl' in validation) || !validation.profileUrl) {
      return res.status(400).json({
        message: 'profileUrl is required from LinkedIn validation.'
      });
    }

    // 3️⃣ Prevent duplicate connection
    const existing = await LinkedinAccount.findOne({
      where: {
        org_id: orgId,
        profile_url: validation.profileUrl
      }
    });

    if (existing) {
      return res.status(409).json({
        message: 'LinkedIn account already connected'
      });
    }

    // 4️⃣ Store encrypted session
    const account = await LinkedinAccount.create({
      org_id: orgId,
      user_id: userId,
      profile_name: validation.profileName,
      profile_url: validation.profileUrl,
      session_cookie_encrypted: encrypt(sessionCookie)
    });

    // 5️⃣ Return safe response with all required fields
    return res.json({
      id: account.getDataValue('id'),
      org_id: account.getDataValue('org_id'),
      user_id: account.getDataValue('user_id'),
      profile_name: account.getDataValue('profile_name'),
      profile_url: account.getDataValue('profile_url'),
      status: account.getDataValue('status'),
      health_score: account.getDataValue('health_score'),
      daily_limit: account.getDataValue('daily_limit'),
      sent_today: account.getDataValue('sent_today'),
      last_checked_at: account.getDataValue('last_checked_at'),
      failure_reason: account.getDataValue('failure_reason'),
      is_active: account.getDataValue('is_active'),
      created_at: account.getDataValue('created_at'),
      updated_at: account.getDataValue('updated_at')
    });
  } catch (err) {
    console.error('[POST /api/linkedin/connect]', err);
    return res.status(500).json({
      message: 'Failed to connect LinkedIn account'
    });
  }
}


export async function listLinkedinAccounts(req: any, res: any) {
  try {
    const userId = req.user.userId;

    const membership = await Membership.findOne({
      where: { user_id: userId }
    });

    const orgId = membership?.getDataValue('organization_id');

    const accounts = await LinkedinAccount.findAll({
      where: { user_id: userId, org_id: orgId },
      attributes: [
        'id',
        'profile_name',
        'profile_url',
        'status',
        'health_score',
        'sent_today',
        'daily_limit',
        'last_checked_at'
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(accounts);
  } catch (err) {
    console.error('LIST LINKEDIN ERROR:', err);
    res.status(500).json({ message: 'Failed to list LinkedIn accounts' });
  }
}
