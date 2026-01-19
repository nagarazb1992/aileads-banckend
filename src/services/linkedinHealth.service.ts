import { LinkedinAccount } from '../models/LinkedinAccount.js';

export async function updateLinkedinHealth(
  accountId: string,
  event: 'SUCCESS' | 'SOFT_FAIL' | 'RATE_LIMIT' | 'BLOCK'
) {
  const account = await LinkedinAccount.findByPk(accountId);
  if (!account) return;

  const map = {
    SUCCESS: 0,
    SOFT_FAIL: -5,
    RATE_LIMIT: -10,
    BLOCK: -40
  };

  const score = Math.max(0, account.health_score + map[event]);

  await account.update({
    health_score: score,
    warning_count: event !== 'SUCCESS'
      ? account.warning_count + 1
      : account.warning_count,
    is_active: score >= 30
  });
}


export async function markLinkedinSuccess(account: LinkedinAccount) {
  await account.update({
    status: 'ACTIVE',
    health_score: Math.min(account.health_score + 10, 100),
    last_checked_at: new Date(),
    failure_reason: null
  });
}

export async function markLinkedinFailure(
  account: LinkedinAccount,
  reason: string
) {
  const newScore = account.health_score - 25;

  await account.update({
    status: newScore <= 0 ? 'DISCONNECTED' : account.status,
    health_score: Math.max(newScore, 0),
    last_checked_at: new Date(),
    failure_reason: reason
  });
}

