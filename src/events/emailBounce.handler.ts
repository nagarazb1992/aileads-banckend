import { Lead } from '../models/lead.model.js';

export async function handleEmailBounce(leadId: string) {
  const lead = await Lead.findByPk(leadId);
  if (!lead) return;

  const downgradedScore = Math.max(20, lead.score - 30);

  await lead.update({
    score: downgradedScore,
    priority: downgradedScore >= 70 ? 'HIGH' : 'LOW',
    meta: {
      ...lead.meta,
      email_bounced: true,
    },
  });
}
