import { Subscription } from '../models/Subscription.js';

export async function subscriptionGuard(req: any, res: any, next: any) {
  const { orgId } = req.user;

  const sub = await Subscription.findOne({ where: { orgId } });

  if (!sub || sub.getDataValue('status') !== 'ACTIVE') {
    return res.status(402).json({
      message: 'Subscription required',
    });
  }

  next();
}
