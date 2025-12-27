import { CreditWallet } from "../models/creditWallet.model.js";
import { Plan } from "../models/Plan.js";
import { Subscription } from "../models/Subscription.js";

export async function handlePaddlePayment(req: any, res: any) {
  const { subscription_id, plan_id } = req.body;

  const subscription = await Subscription.findOne({
    where: { id: subscription_id },
  });

  if (!subscription) return res.sendStatus(404);

  subscription.setDataValue('status', 'ACTIVE');
  await subscription.save();

  const plan = await Plan.findByPk(plan_id);

  // ✅ Allocate credits AFTER payment
  await CreditWallet.create({
    orgId: subscription.getDataValue('orgId'),
    balance: (plan as any).monthlyCredits,
  });

  res.sendStatus(200);
}
