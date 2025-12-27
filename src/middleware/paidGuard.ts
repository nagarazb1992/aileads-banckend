
import { Subscription } from "../models/Subscription.js";
import { Membership } from "../models/membership.model.js";

export async function paidGuard(req: any, res: any, next: any) {
  
  try {
    // Always use userId (from JWT or req.user)
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'Missing userId in user context' });
    }

    console.log("PAID GUARD - userId:", userId);
    // Find membership by userId
    const membership = await Membership.findOne({ where: { user_id: userId } });
    const orgId = membership ? membership.getDataValue('organization_id') : undefined;
    if (!orgId) {
      return res.status(400).json({ message: 'Missing orgId in user context 01' });
    }
    
    const sub = await Subscription.findOne({
      where: {
        orgId: orgId,
        status: 'ACTIVE',
      },
    });

    if (!sub) {
      return res.status(402).json({
        code: 'PAYMENT_REQUIRED',
        message: 'Active subscription required',
      });
    }

    next();
  } catch (err) {
    console.error('PAID GUARD ERROR:', err);
    res.status(500).json({ message: 'Payment validation failed' });
  }
}
