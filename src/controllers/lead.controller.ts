import type { Request, Response } from "express";
import { Subscription } from "../models/Subscription.js";
import { Lead, Membership, Plan } from "../models/index.js";

/**
 * CREATE LEAD
 * Cost: 1 credit (handled by creditGuard)
 */
// Define a type for req.user
type AuthUser = {
  orgId: string;
  // add other user properties if needed
};

type AuthRequest = Request & { user: AuthUser };
export async function createLead(req: any, res: Response) {
  try {
    const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;
    // If orgId is not present, try to get it from membership
    if (!orgId && req.user?.userId) {
      const membership = await Membership.findOne({
        where: { user_id: req.user.userId },
      });
      if (membership) {
        orgId = membership.getDataValue("organization_id");
      }
    }
    if (!orgId) {
      return res
        .status(400)
        .json({ message: "Missing orgId in user context 09" });
    }

    // Only require and save necessary fields
    const requiredFields = ["fullName", "email", "companyName", "source"];
    const missingFields = requiredFields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field].toString().trim() === ""
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    // Destructure all fields from request
    const { fullName, email, companyName, source } = req.body;

    // 1️⃣ Get active subscription
    console.log("DEBUG querying Subscription with org_id:", orgId);
    const subscription = await Subscription.findOne({
      where: { orgId: orgId, status: "ACTIVE" },
      include: [Plan],
    });

    // Plan may be included as association, but in Sequelize v6+ ESM, use get('Plan')
    if (!subscription) {
      return res.status(402).json({
        message: "Active subscription required",
      });
    }
    // Plan may be included as association, but in Sequelize v6+ ESM, use get('Plan')
    const plan = (
      subscription.get ? subscription.get("Plan") : (subscription as any).Plan
    ) as typeof Plan | undefined;
    if (!plan) {
      return res.status(402).json({
        message: "Active subscription required",
      });
    }

    // 2️⃣ Enforce plan lead limits
    console.log("DEBUG querying Lead.count with org_id:", orgId);
    const leadsCount = await Lead.count({
      where: { org_id: orgId },
    });

    if (leadsCount >= (plan as any).getDataValue("monthlyLeadLimit")) {
      return res.status(403).json({
        code: "LEAD_LIMIT_REACHED",
        message: "Monthly lead limit reached. Upgrade plan.",
      });
    }

    // 3️⃣ Create lead (credits already deducted by middleware)

    const lead = await Lead.create({
      org_id: orgId,
      organization_id: orgId,
      fullName,
      email,
      companyName,
      source,
    });

    res.status(201).json(lead);
  } catch (error: any) {
    console.error("CREATE LEAD ERROR:", error);
    res.status(500).json({
      message: "Failed to create lead",
    });
    console.error("CREATE LEAD ERROR:", error);
  }
}

export async function getAllLeads(req: any, res: Response) {
  try {
    const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;
    // If orgId is not present, try to get it from membership
    if (!orgId && req.user?.userId) {
      const membership = await Membership.findOne({
        where: { user_id: req.user.userId },
      });
      if (membership) {
        orgId = membership.getDataValue("organization_id");
      }
    }
    if (!orgId) {
      return res
        .status(400)
        .json({ message: "Missing orgId in user context 09" });
    }
    const leads = await Lead.findAll({
      where: { org_id: orgId },
    });
    res.status(200).json(leads);
  } catch (error: any) {
    console.error("GET ALL LEADS ERROR:", error);
    res.status(500).json({
      message: "Failed to get leads",
    });
  }
}

// Update a lead by ID
export async function updateLead(req: any, res: Response) {
  try {
    const { id } = req.params;
    const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;
    if (!orgId) {
      return res.status(400).json({ message: "Missing orgId in user context" });
    }
    const lead = await Lead.findOne({ where: { id, org_id: orgId } });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    await lead.update(req.body);
    res.status(200).json(lead);
  } catch (error: any) {
    console.error("UPDATE LEAD ERROR:", error);
    res.status(500).json({ message: "Failed to update lead" });
  }
}

// Get a single lead by ID (edit)
export async function getLead(req: any, res: Response) {
  try {
    const { id } = req.params;
    const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;
    if (!orgId) {
      return res.status(400).json({ message: "Missing orgId in user context" });
    }
    const lead = await Lead.findOne({ where: { id, org_id: orgId } });
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    res.status(200).json(lead);
  } catch (error: any) {
    console.error("GET LEAD ERROR:", error);
    res.status(500).json({ message: "Failed to get lead" });
  }
}
