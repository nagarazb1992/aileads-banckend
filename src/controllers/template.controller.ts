import e from "express";
import { EmailTemplate } from "../models/EmailTemplate.js";
import { Membership } from "../models/membership.model.js";
import { generateEmailTemplate } from "../services/aiTemplate.controller.js";


export async function createTemplate(req:any, res:any) {
const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const template = await EmailTemplate.create({
    org_id: orgId,
    name: req.body.name,
    subject: req.body.subject,
    body: req.body.body,
    created_by_ai: false
  });

  res.json(template);
}

export async function getTemplates(req:any, res:any) {
const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const templates = await EmailTemplate.findAll({
    where: { org_id: orgId },
  });
  res.json(templates);
}



export async function getAITemplates(req:any, res:any) {
const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const aiTemplates = await EmailTemplate.findAll({
    where: { org_id: orgId, created_by_ai: true },
  });
  res.json(aiTemplates);
}

export async function editTemplate(req:any, res:any) {
const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const { templateId } = req.params;
  const { name, subject, body } = req.body;
    const template = await EmailTemplate.findOne({
        where: { id: templateId, org_id: orgId },
    });

    if (!template) {
        return res.status(404).json({ message: "Template not found" });
    }
    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.body = body || template.body;
    await template.save();
    res.json(template);
}

export async function generateTemplateWithAI(req:any, res:any) {
  const aiContent = await generateEmailTemplate(req.body);

  // Simple parsing
  const [subjectLine, ...bodyLines] = aiContent.split('\n');

  const template = await EmailTemplate.create({
    org_id: req.user.orgId,
    name: 'AI Generated Template',
    subject: subjectLine.replace('Subject:', '').trim(),
    body: bodyLines.join('\n').trim(),
    created_by_ai: true
  });

  res.json(template);
}

