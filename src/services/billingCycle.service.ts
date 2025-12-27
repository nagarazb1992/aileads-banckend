import { Subscription, Plan, CreditWallet, CreditTransaction } from '../models/index.js';
import { Op } from 'sequelize';

export async function resetCreditsIfNeeded(subscription: any) {
  const now = new Date();

  // Already reset this cycle
  if (
    subscription.last_credit_reset_at &&
    subscription.last_credit_reset_at >= subscription.billing_cycle_start
  ) {
    return;
  }

  const plan = await Plan.findByPk(subscription.plan_id);
  if (!plan) return;

  // Reset wallet
  const wallet = await CreditWallet.findOne({
    where: { org_id: subscription.org_id },
  });

  if (!wallet) return;

  wallet.setDataValue('balance', plan.getDataValue('monthlyCredits'));
  await wallet.save();

  // Log transaction
  await CreditTransaction.create({
    org_id: subscription.org_id,
    amount: plan.getDataValue('monthlyCredits'),
    reason: 'monthly_credit_reset',
  });

  subscription.last_credit_reset_at = now;
  await subscription.save();
}
