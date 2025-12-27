import { Plan } from "../models/Plan.js";
import { Subscription } from "../models/Subscription.js";

export async function createSubscription(req:any, res:any) {
  const { orgId } = req.user;
  const { planId } = req.body;

  const plan = await Plan.findByPk(planId);
  if (!plan) return res.status(400).json({ message: 'Invalid plan' });

  const sub = await Subscription.create({
    org_id: orgId,
    plan_id: plan.getDataValue('id'),
    status: 'PENDING',
    provider: 'PADDLE',
  });

  res.json({
    subscriptionId: sub.getDataValue('id'),
    checkoutUrl: `https://checkout.paddle.com/pay/${plan.getDataValue('id')}`,
  });
}
