
import crypto from "crypto";
import { Plan } from "../models/Plan.js";
import { Subscription } from "../models/Subscription.js";
import { CreditWallet } from "../models/creditWallet.model.js";
import BillingEvent from "../models/billingEvent.model.js";
import User from "../models/User.js";
import { Membership } from "../models/membership.model.js";

export const dodoWebhook = async (req:any, res:any) => {
  const signature = req.headers["dodo-signature"];
  const payload = req.body;

  console.log("Received Dodo webhook:", payload);

  const expectedSignature = crypto
    .createHmac("sha256", process.env.DODO_WEBHOOK_SECRET!)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(payload.toString());

  switch (event.type) {
    case "subscription.created":
    case "subscription.active": {
      // Dodo payment webhook logic (mapped to sample data)
      const data = event.data;
      const eventId = data.subscription_id;
      const planId = data.product_id; // Map product_id to planId
      const orgId = data.customer?.customer_id || null; // Use customer_id as orgId (adjust as needed)
      const userEmail = data.customer?.email;

      // If orgId is not provided, try to get it from user email
      let resolvedOrgId = orgId;
      if (!resolvedOrgId && userEmail) {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
          throw new Error('User not found for email: ' + userEmail);
        }
        const membership = await Membership.findOne({ where: { user_id: user.getDataValue('id') } });
        if (!membership) {
          throw new Error('Membership not found for user');
        }
        resolvedOrgId = membership.getDataValue('organization_id');
      }

      if (!planId || !resolvedOrgId) {
        throw new Error('Missing orgId or planId in webhook data, and could not resolve from user');
      }

      // 1️⃣ Idempotency check
      const existingEvent = await BillingEvent.findOne({
        where: { provider_event_id: eventId },
      });
      if (existingEvent) return res.json({ received: true });

      // 2️⃣ Validate plan
      const plan = await Plan.findByPk(planId);
      if (!plan) throw new Error(`Invalid plan: ${planId}`);

      // 3️⃣ Create or activate subscription
      let subscription = await Subscription.findOne({
        where: { orgId: resolvedOrgId },
      });

      // Use Dodo's period fields for currentPeriodEnd if available
      const now = new Date();
      let currentPeriodEnd = null;
      if (data.next_billing_date) {
        currentPeriodEnd = new Date(data.next_billing_date);
      } else if (data.expires_at) {
        currentPeriodEnd = new Date(data.expires_at);
      } else {
        currentPeriodEnd = new Date(now);
        currentPeriodEnd.setMonth(now.getMonth() + 1);
      }

      if (!subscription) {
        subscription = await Subscription.create({
          orgId: resolvedOrgId,
          planId: plan.getDataValue('id'),
          status: data.status ? data.status.toUpperCase() : 'ACTIVE',
          provider: 'PADDLE',
          providerSubscriptionId: data.subscription_id,
          currentPeriodStart: now,
          currentPeriodEnd: currentPeriodEnd,
        });
        console.log('Inserted Subscription:', subscription.toJSON());
      } else {
        subscription.setDataValue('status', data.status ? data.status.toUpperCase() : 'ACTIVE');
        subscription.setDataValue('planId', plan.getDataValue('id'));
        subscription.setDataValue('providerSubscriptionId', data.subscription_id);
        subscription.setDataValue('currentPeriodStart', now);
        subscription.setDataValue('currentPeriodEnd', currentPeriodEnd);
        await subscription.save();
        console.log('Updated Subscription:', subscription.toJSON());
      }

      // 4️⃣ Allocate credits based on plan id (fallback to plan name if needed)
      const planCreditsMap = {
        starter: 500,
        growth: 2000,
        pro: 5000,
        agency: 15000,
      };
      let planKey = plan.getDataValue('id');
      if (!planCreditsMap[planKey] && plan.getDataValue('name')) {
        planKey = plan.getDataValue('name').toLowerCase();
      }
      let credits = 0;
      if (
        planKey === 'starter' ||
        planKey === 'growth' ||
        planKey === 'pro' ||
        planKey === 'agency'
      ) {
        credits = planCreditsMap[planKey as keyof typeof planCreditsMap];
      }
      let wallet = await CreditWallet.findOne({ where: { organization_id: resolvedOrgId } });
      if (!wallet) {
        wallet = await CreditWallet.create({
          organization_id: resolvedOrgId,
          balance: credits,
        });
        console.log('Inserted CreditWallet:', wallet.toJSON());
      } else {
        wallet.setDataValue('balance', wallet.getDataValue('balance') + credits);
        await wallet.save();
        console.log('Updated CreditWallet:', wallet.toJSON());
      }

      // 5️⃣ Log billing event
      const billingEvent = await BillingEvent.create({
        org_id: resolvedOrgId,
        subscription_id: subscription.getDataValue('id'),
        provider: 'PADDLE',
        event_type: event.type,
        provider_event_id: eventId,
        payload: data,
      });
      console.log('Inserted BillingEvent:', billingEvent.toJSON());

      console.log("Subscription active:", subscription.getDataValue('id'));
      break;
    }

    case "payment.succeeded": {
      console.log("Payment success:", event.data.id);
      break;
    }

    case "subscription.cancelled": {
      console.log("Subscription cancelled:", event.data.id);
      break;
    }
  }

  res.json({ received: true });
};
