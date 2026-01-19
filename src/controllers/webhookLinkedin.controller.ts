import { InboundMessage } from "../models/InboundMessage.js";
import { analyzeInboundMessage } from "../services/inboundAI.service.js";

export async function linkedinWebhook(req:any, res:any) {
  const { orgId, leadId, campaignId, message } = req.body;

  const ai = await analyzeInboundMessage(message);

  await InboundMessage.create({
    org_id: orgId,
    lead_id: leadId,
    campaign_id: campaignId,
    channel: 'LINKEDIN',
    message,
    sentiment: ai.sentiment,
    ai_summary: ai.summary,
    confidence: ai.confidence
  });

  res.sendStatus(200);
}
