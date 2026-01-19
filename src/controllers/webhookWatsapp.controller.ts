// src/controllers/webhookWhatsapp.controller.ts
import { InboundMessage } from '../models/InboundMessage.js';
import { analyzeInboundMessage } from '../services/inboundAI.service.js';

export async function whatsappWebhook(req:any, res:any) {
  const { orgId, leadId, campaignId, message } = req.body;

  const ai = await analyzeInboundMessage(message);

  await InboundMessage.create({
    org_id: orgId,
    lead_id: leadId,
    campaign_id: campaignId,
    channel: 'WHATSAPP',
    message,
    sentiment: ai.sentiment,
    ai_summary: ai.summary,
    confidence: ai.confidence
  });

  res.sendStatus(200);
}
