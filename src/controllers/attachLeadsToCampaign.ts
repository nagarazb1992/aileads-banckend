import { Campaign } from "../models/campaign.model.js";
import { CampaignLead } from "../models/CampaignLead.js";
import { Lead } from "../models/lead.model.js";
import { Membership } from "../models/membership.model.js";

export async function attachLeadsToCampaign(req:any, res:any) {
  const { campaignId } = req.params;
  const { leadIds } = req.body;
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  // Fetch leads
  const leads = await Lead.findAll({
    where: { id: leadIds, org_id: orgId }
  });

  // 🔥 Deduplicate by email
  const seenEmails = new Set<string>();
  const rows = [];

  for (const lead of leads) {
    if (!lead.email) continue;

    const emailKey = lead.email.toLowerCase();
    if (seenEmails.has(emailKey)) continue;

    seenEmails.add(emailKey);

    rows.push({
      campaign_id: campaignId,
      lead_id: lead.id,
      email_snapshot: emailKey,
      status: 'ACTIVE',
      current_step: 0
    });
  }

  await CampaignLead.bulkCreate(rows, {
    ignoreDuplicates: true
  });

  res.json({
    attached: rows.length,
    skippedDuplicates: leads.length - rows.length
  });
}


export async function getAllCampaignLeads(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { campaignId } = req.params;
  const campaign = await Campaign.findOne({
    where: { id: campaignId, org_id: orgId },
  });

  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }
  const campaignLeads = await CampaignLead.findAll({
    where: { campaign_id: campaignId },
  });

  // Fetch lead details for each campaign lead
  const leadsWithDetails = await Promise.all(
    campaignLeads.map(async (cl: any) => {
      const lead = await Lead.findOne({
        where: { id: cl.lead_id },
        attributes: [
          "id",
          "fullName",
          "email",
          "companyName",
          "companyDomain",
          "jobTitle",
          "linkedin_url",
          "status",
          "priority"
        ]
      });
      return {
        ...cl.toJSON(),
        lead: lead ? lead.toJSON() : null
      };
    })
  );
  res.json(leadsWithDetails);
}


export async function deattachLeadsFromCampaign(req: any, res: any) {
  const { campaignId } = req.params;
  if (!req.body || !req.body.leadIds) {
    return res.status(400).json({ message: "leadIds is required in request body" });
  }
  const { leadIds }: { leadIds: string[] } = req.body;

  // Check membership and campaign ownership
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership ? membership.getDataValue("organization_id") : undefined;

  const campaign = await Campaign.findOne({
    where: { id: campaignId, org_id: orgId },
  });

  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  // Remove campaign leads
  const deletedCount = await CampaignLead.destroy({
    where: {
      campaign_id: campaignId,
      lead_id: leadIds,
    },
  });

  res.json({
    message: "Leads detached successfully",
    detached: deletedCount,
  });
}