import { startOutboundCampaign } from '../services/outbound.service.js';

export async function startCampaign(req: any, res: any) {
  const { orgId } = req.user;
  const { name, channel, leadIds, useAI } = req.body;

  await startOutboundCampaign({
    orgId,
    name,
    channel,
    leadIds,
    useAI,
  });

  res.json({ message: 'Outbound campaign started' });
}
