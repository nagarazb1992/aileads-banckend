import { or } from "sequelize";
import sequelize from "../config/database.js";
import { CampaignSequence } from "../models/CampaignSequence.js";
import { Campaign, CampaignStep, Lead, Membership } from "../models/index.js";
import e from "express";
import { CampaignLead } from "../models/CampaignLead.js";
import { enqueueCampaignEmails } from "../services/campaignExecution.service.js";
import { scheduleCampaignEmails } from "../services/campaignScheduler.service.js";

export async function createCampaign(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  console.log("Organization ID for campaign creation:", orgId);

  const { name, channel, sequence_id, status } = req.body;

  console.log("Creating campaign with data:", req.body);

  const tx = await sequelize.transaction();

  try {
    // 1️⃣ Create campaign
    // Map channel to valid ENUM value
    let dbChannel = channel;
    if (typeof channel === "string") {
      if (["email", "EMAIL"].includes(channel)) dbChannel = "EMAIL";
      else if (["linkedin", "LINKEDIN"].includes(channel))
        dbChannel = "LINKEDIN";
      else if (["whatsapp", "WHATSAPP"].includes(channel))
        dbChannel = "WHATSAPP";
      else dbChannel = "EMAIL"; // fallback or handle error as needed
    }
    const campaign = (await Campaign.create(
      {
        name: name,
        org_id: orgId,
        sequence_id: sequence_id,
        primary_channel: dbChannel,
        status: status,
        organization_id: orgId,
      },
      { returning: true, transaction: tx }
    )) as Campaign & { [key: string]: any };

    console.log("Campaign created with ID:", campaign.id);

    await tx.commit();

    res.status(201).json({
      campaignId: campaign.id,
      status: "CREATED",
    });
  } catch (error) {
    await tx.rollback();
    console.error("CAMPAIGN CREATE ERROR:", error);
    res.status(500).json({ message: "Failed to create campaign" });
  }
}

export async function getCampaigns(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  try {
    const campaigns = await Campaign.findAll({
      where: { org_id: orgId },
    });
    res.json(campaigns);
  } catch (error) {
    console.error("GET CAMPAIGNS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch campaigns" });
  }
}

export async function getCampaignById(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { campaignId } = req.params;
  try {
    const campaign = await Campaign.findOne({
      where: { id: campaignId, org_id: orgId },
    });
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json(campaign);
  } catch (error) {
    console.error("GET CAMPAIGN BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch campaign" });
  }
}

export async function deleteCampaign(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const campaignId = req.params.id;
  try {
    const deletedCount = await Campaign.destroy({
      where: { id: campaignId, org_id: orgId },
    });
    if (deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Campaign not found or not authorized" });
    }
    res.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("DELETE CAMPAIGN ERROR:", error);
    res.status(500).json({ message: "Failed to delete campaign" });
  }
}

export async function updateCampaign(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const campaignId = req.params.id;
  const { name, channel, sequence_id, status } = req.body;
  try {
    const campaign = (await Campaign.findOne({
      where: { id: campaignId, org_id: orgId },
    })) as Campaign & { [key: string]: any };
    if (!campaign) {
      return res
        .status(404)
        .json({ message: "Campaign not found or not authorized" });
    }
    // Map channel to valid ENUM value
    let dbChannel = channel;
    if (typeof channel === "string") {
      if (["email", "EMAIL"].includes(channel)) dbChannel = "EMAIL";
      else if (["linkedin", "LINKEDIN"].includes(channel))
        dbChannel = "LINKEDIN";
      else if (["whatsapp", "WHATSAPP"].includes(channel))
        dbChannel = "WHATSAPP";
      else dbChannel = "EMAIL";
    }
    campaign.name = name || campaign.name;
    campaign.primary_channel = dbChannel || campaign.primary_channel;
    campaign.sequence_id = sequence_id || campaign.sequence_id;
    campaign.status = status || campaign.status;
    await campaign.save();
    res.json({ message: "Campaign updated successfully", campaign });
  } catch (error) {
    console.error("UPDATE CAMPAIGN ERROR:", error);
    res.status(500).json({ message: "Failed to update campaign" });
  }
}

// Campaign start
export async function startCampaignWithLeads(req: any, res: any) {
  const { campaignId } = req.params;
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  // 1️⃣ Validate campaign
  const campaign = await Campaign.findOne({
    where: { id: campaignId, org_id: orgId },
  });

  if (!campaign) {
    console.error("[CAMPAIGN] Campaign not found:", campaignId);
    return res.status(404).json({ message: "Campaign not found" });
  }

  if ((campaign as any).status === "RUNNING") {
    console.warn("[CAMPAIGN] Campaign already running:", campaignId);
    return res.status(400).json({ message: "Campaign already running" });
  }

  const { leadIds } = req.body;
  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    console.warn("[CAMPAIGN] No leads selected for campaign:", campaignId);
    return res.status(400).json({ message: "No leads selected" });
  }

  // 2️⃣ Validate leads belong to org
  const leads = await Lead.findAll({
    where: {
      id: leadIds,
      org_id: orgId,
    },
  });

  if (leads.length === 0) {
    console.error(
      "[CAMPAIGN] Invalid leads selected for campaign:",
      campaignId
    );
    return res.status(400).json({ message: "Invalid leads selected" });
  }

  // 3️⃣ Get existing leadIds from CampaignLead for this campaign
  const existingCampaignLeads = await CampaignLead.findAll({
    where: { campaign_id: campaignId },
    attributes: ["lead_id"],
  });
  const existingLeadIds = existingCampaignLeads.map((cl: any) => cl.lead_id);

  // 4️⃣ Attach only new leads to campaign (avoid duplicates)
  const newLeads = leads.filter((lead: any) => !existingLeadIds.includes(lead.id));
  const campaignLeads = newLeads.map((lead: any) => ({
    campaign_id: campaignId,
    lead_id: lead.id,
    current_step: 0,
    status: "ACTIVE",
  }));

  if (campaignLeads.length > 0) {
    await CampaignLead.bulkCreate(campaignLeads, {
      ignoreDuplicates: true,
    });
  }

  // 5️⃣ Start campaign
  await campaign.update({ status: "RUNNING" });

  // 6️⃣ Enqueue email sending
  // await enqueueCampaignEmails(
  //   campaignId,
  //   orgId,
  //   campaign.sequence_id as string
  // );

  await scheduleCampaignEmails(campaignId);

  res.json({
    message: "Campaign started successfully",
    campaignId,
    leadsAdded: campaignLeads.length,
    existingLeadIds,
  });
}

export async function pauseCampaign(req:any, res:any) {
  const { campaignId } = req.params;
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  const updated = await Campaign.update(
    { status: 'PAUSED' },
    { where: { id: campaignId, org_id: orgId, status: 'RUNNING' } }
  );

  if (!updated[0]) {
    return res.status(400).json({ message: 'Campaign not running' });
  }

  res.json({ message: 'Campaign paused' });
}

export async function resumeCampaign(req:any, res:any) {
  const { campaignId } = req.params;
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  const campaign = await Campaign.findOne({
    where: { id: campaignId, org_id: orgId }
  });

  if (!campaign || campaign.status !== 'PAUSED') {
    return res.status(400).json({ message: 'Campaign not paused' });
  }

  await campaign.update({ status: 'RUNNING' });

  // Resume from next step
  await enqueueSequenceStep(campaignId, undefined);

  res.json({ message: 'Campaign resumed' });
}


