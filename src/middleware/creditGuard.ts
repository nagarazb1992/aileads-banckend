import { Membership } from "../models/membership.model.js";
import { consumeCredits } from "../services/credit.service.js";

export function creditGuard({
  cost,
  reason,
}: {
  cost: number;
  reason: string;
}) {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Missing userId in user context" });
    }
    // Find membership by userId
    const membership = await Membership.findOne({ where: { user_id: userId } });
    const orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;

    try {
      await consumeCredits({
        orgId: orgId,
        amount: cost,
        reason,
      });
      next();
    } catch (err: any) {
      if (err.message === "INSUFFICIENT_CREDITS") {
        return res.status(402).json({
          code: "INSUFFICIENT_CREDITS",
          message: "Please upgrade your plan",
        });
      }
      next(err);
    }
  };
}
