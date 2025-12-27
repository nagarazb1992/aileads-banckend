import { enrichLeadAI } from '../services/enrich.service.js';

export async function enrichLead(req: any, res: any) {
  const { orgId } = req.user;
  const { leadId } = req.body;

  await enrichLeadAI({ orgId, leadId });

  res.json({ message: 'Enrichment started' });
}
