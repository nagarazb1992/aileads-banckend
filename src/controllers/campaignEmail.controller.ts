import { Campaign } from "../models/campaign.model.js";
import { EmailAccount } from "../models/EmailAccount.js";
import { Membership } from "../models/index.js";

export async function connectEmailToCampaign(req: any, res: any) {
  const { campaignId } = req.params;
  const { emailAccountId } = req.body;
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId)
    return res.status(400).json({ error: "Organization not found for user" });

  if (!emailAccountId) {
    return res.status(400).json({ message: "emailAccountId is required" });
  }

  // 1️⃣ Verify campaign belongs to org
  const campaign = await Campaign.findOne({
    where: {
      id: campaignId,
      org_id: orgId,
    },
  });

  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  // 2️⃣ Verify email account belongs to org
  const emailAccount = await EmailAccount.findOne({
    where: {
      id: emailAccountId,
      org_id: orgId,
      is_active: true,
    },
  });

  if (!emailAccount) {
    return res.status(404).json({ message: "Email account not found" });
  }

  // 3️⃣ Attach email to campaign
  await campaign.update({
    email_account_id: emailAccountId,
  });

  res.json({
    message: "Email account connected to campaign",
    campaignId,
    emailAccountId,
  });
}
