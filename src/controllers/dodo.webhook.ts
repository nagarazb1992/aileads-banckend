
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
    case "subscription.updated": {
      // Dodo payment webhook logic
      const data = event.data;
      const eventId = data.id;
      console.log('Dodo webhook custom_data:', data.custom_data);
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
      if (existingEvent) return res.json({ received: true });

      // 2️⃣ Validate plan
      const plan = await Plan.findByPk(planId);
      if (!plan) throw new Error(`Invalid plan: ${planId}`);

      // 3️⃣ Create or activate subscription
      let subscription = await Subscription.findOne({
        where: { orgId: orgId },
      });

      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);

      if (!subscription) {
        subscription = await Subscription.create({
          orgId: orgId,
          planId: plan.getDataValue('id'),
          status: 'ACTIVE',
          provider: 'PADDLE',
          providerSubscriptionId: data.id,
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        });
        console.log('Inserted Subscription:', subscription.toJSON());
      } else {
        subscription.setDataValue('status', 'ACTIVE');
        subscription.setDataValue('planId', plan.getDataValue('id'));
        subscription.setDataValue('providerSubscriptionId', data.id);
        subscription.setDataValue('currentPeriodStart', now);
        subscription.setDataValue('currentPeriodEnd', nextMonth);
        await subscription.save();
        console.log('Updated Subscription:', subscription.toJSON());
      }

      // 4️⃣ Allocate credits based on plan id
      const planCreditsMap = {
        starter: 500,
        growth: 2000,
        pro: 5000,
        agency: 15000,
      };
      const planKey = String(plan.getDataValue('id'));
      let credits = 0;
      if (planKey === 'starter' || planKey === 'growth' || planKey === 'pro' || planKey === 'agency') {
        credits = planCreditsMap[planKey];
      }
      let wallet = await CreditWallet.findOne({ where: { organization_id: orgId } });
      if (!wallet) {
        wallet = await CreditWallet.create({
          organization_id: orgId,
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
        org_id: orgId,
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
