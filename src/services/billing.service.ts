
import BillingEvent from "../models/billingEvent.model.js";
import { CreditWallet } from "../models/creditWallet.model.js";
import { Plan } from "../models/Plan.js";
import { Subscription } from "../models/Subscription.js";
import User from "../models/User.js";
import { Membership } from "../models/membership.model.js";


export async function handleCheckoutCompleted(event: any) {
  const data = event.data;

  const eventId = data.id; // che_xxx
  console.log('Paddle webhook custom_data:', data.custom_data);
  const planId = data.custom_data?.plan?.toLowerCase();
  let orgId = data.custom_data?.orgId || null;

  // If orgId is not provided, try to get it from user email
  if (!orgId && data.custom_data?.email) {
    const user = await User.findOne({ where: { email: data.custom_data.email } });
    if (!user) {
      throw new Error('User not found for email: ' + data.custom_data.email);
    }
    const membership = await Membership.findOne({ where: { user_id: user.getDataValue('id') } });
    if (!membership) {
      throw new Error('Membership not found for user');
    }
    orgId = membership.getDataValue('organization_id');
  }

  if (!planId || !orgId) {
    throw new Error('Missing orgId or plan in custom_data, and could not resolve from user');
  }

  // 1️⃣ Idempotency check
  const existingEvent = await BillingEvent.findOne({
    where: { provider_event_id: eventId },
  });
  if (existingEvent) return;

  // 2️⃣ Validate plan
  const plan = await Plan.findByPk(planId);
  if (!plan) throw new Error(`Invalid plan: ${planId}`);

  // 3️⃣ Create or activate subscription
  let subscription = await Subscription.findOne({
    where: { org_id: orgId },
  });

  if (!subscription) {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    subscription = await Subscription.create({
      orgId: orgId,
      planId: plan.getDataValue('id'),
      status: 'ACTIVE',
      provider: 'PADDLE',
      providerSubscriptionId: data.transaction_id,
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
    });
  } else {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    subscription.setDataValue('status', 'ACTIVE');
    subscription.setDataValue('plan_id', plan.getDataValue('id'));
    subscription.setDataValue('providerSubscriptionId', data.transaction_id);
    subscription.setDataValue('currentPeriodStart', now);
    subscription.setDataValue('currentPeriodEnd', nextMonth);
    await subscription.save();
  }

  // 4️⃣ Allocate credits based on plan id
  const planCreditsMap: Record<string, number> = {
    starter: 500,
    growth: 2000,
    pro: 5000,
    agency: 15000,
  };
  const planKey = plan.getDataValue('id');
  const credits = planCreditsMap[planKey] || 0;
  const wallet = await CreditWallet.findOne({ where: { organization_id: orgId } });
  if (!wallet) {
    await CreditWallet.create({
      organization_id: orgId,
      balance: credits,
    });
  } else {
    wallet.setDataValue('balance', wallet.getDataValue('balance') + credits);
    await wallet.save();
  }

  // 5️⃣ Log billing event
  await BillingEvent.create({
    org_id: orgId,
    subscription_id: subscription.getDataValue('id'),
    provider: 'PADDLE',
    event_type: event.name, // checkout.completed
    provider_event_id: eventId,
    payload: data,
  });
}
