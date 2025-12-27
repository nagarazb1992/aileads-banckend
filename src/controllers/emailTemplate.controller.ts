import { generateAICopy } from "../services/aiCopy.service.js";

import { EmailTemplate } from "../models/EmailTemplate.js";
import { Membership } from "../models/membership.model.js";
import { SequenceStep } from "../models/SequenceStep.js";

/**
 * CREATE TEMPLATE
 */
export async function createTemplate(req: any, res: any) {
  const { name, subject, body } = req.body;

  if (!name || !subject || !body) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;


  const template = await EmailTemplate.create({
    org_id: orgId,
    name,
    subject,
    body,
    created_by_ai: false,
    is_archived: false,
  });

  res.status(201).json(template);
}

/**
 * LIST TEMPLATES (ACTIVE ONLY)
 */
export async function listTemplates(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const templates = await EmailTemplate.findAll({
    where: {
      org_id: orgId,
      is_archived: false,
    },
    order: [["createdAt", "DESC"]],
  });

  res.json(templates);
}

/**
 * GET SINGLE TEMPLATE
 */
export async function getTemplateById(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const template = await EmailTemplate.findOne({
    where: {
      id: req.params.id,
      org_id: orgId,
    },
  });

  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  res.json(template);
}

/**
 * UPDATE TEMPLATE
 */
export async function updateTemplate(req: any, res: any) {
  const { name, subject, body, category } = req.body;

  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  const template = await EmailTemplate.findOne({
    where: {
      id: req.params.id,
      org_id: orgId,
      is_archived: false,
    },
  });

  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  await template.update({
    name: name ?? template.name,
    subject: subject ?? template.subject,
    body: body ?? template.body
  });

  res.json(template);
}

/**
 * ARCHIVE TEMPLATE (SOFT DELETE)
 */
export async function archiveTemplate(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const template = await EmailTemplate.findOne({
    where: {
      id: req.params.id,
      org_id: orgId,
    },
  });

  if (!template) {
    return res.status(404).json({ message: "Template not found" });
  }

  // 🔒 SAFETY: prevent archiving if used in sequences
  const usageCount = await SequenceStep.count({
    where: { template_id: template.id },
  });

  if (usageCount > 0) {
    return res.status(400).json({
      message: "Template is used in a sequence and cannot be archived",
    });
  }

  await template.update({ is_archived: true });

  res.json({ message: "Template archived successfully" });
}


/**
 * GENERATE ADVANCED EMAIL BODY VIA AI
 */
export async function generateAdvancedEmailBody(req: any, res: any) {
  try {
    const { name, subject } = req.body;
    if (!name || !subject ) {
      return res.status(400).json({ message: "Missing lead information (name, company required)" });
    }
    const result = await generateAICopy(name, subject);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate email body", error: (error && typeof error === 'object' && 'message' in error) ? (error as any).message : String(error) });
  }
}


