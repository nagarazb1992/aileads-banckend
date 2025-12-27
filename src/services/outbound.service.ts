
import { enqueueOutbound } from '../queues/outbound.queue.js';
import { generateAICopy } from './aiCopy.service.js';
import { sendEmail } from './email.service.js';
import { sendLinkedInMessage } from './linkedin.service.js';
import { consumeCredits } from './credit.service.js';
import OutboundMessage from '../models/OutboundMessage.js';
import OutboundCampaign, { OutboundCampaignStatus } from '../models/OutboundCampaign.js';
import { Lead } from '../models/lead.model.js';
import { OutboundMessageStatus } from '../models/OutboundMessage.js';

export async function startOutboundCampaign({
  orgId,
  name,
  channel,
  leadIds,
  useAI,
}: any) {
  const campaign = await OutboundCampaign.create({
    org_id: orgId,
    name,
    channel,
    status: OutboundCampaignStatus.RUNNING,
  });

  for (const leadId of leadIds) {
    const lead = await Lead.findByPk(leadId);
    if (!lead) continue;

    const copy = useAI
      ? await generateAICopy(lead)
      : { subject: 'Hello', body: 'Let’s connect' };

    const msg = await OutboundMessage.create({
      campaign_id: campaign.id,
      lead_id: lead.getDataValue('id'),
      channel,
      subject: copy.subject,
      body: copy.body ?? '',
      status: OutboundMessageStatus.PENDING,
    });

    await enqueueOutbound({ messageId: msg.id });
  }
}

export async function processOutbound({ messageId }: any) {
  const msg = await OutboundMessage.findByPk(messageId, {
    include: [{ model: Lead, as: 'Lead' }],
  });
  if (!msg || msg.status !== OutboundMessageStatus.PENDING) return;

  try {
    const lead = (msg as any).Lead || (msg as any).lead || null;
    if (!lead) throw new Error('Lead not found in OutboundMessage association');
    if (msg.channel === 'EMAIL') {
      await sendEmail(lead.email, msg.subject, msg.body);
      await consumeCredits({
        orgId: lead.org_id,
        amount: 1,
        reason: 'email_sent',
        referenceId: msg.id,
      });
    }

    if (msg.channel === 'LINKEDIN') {
      await sendLinkedInMessage(lead.linkedinUrl, msg.body);
      await consumeCredits({
        orgId: lead.org_id,
        amount: 2,
        reason: 'linkedin_sent',
        referenceId: msg.id,
      });
    }

    msg.status = OutboundMessageStatus.SENT;
    msg.sentAt = new Date();
    await msg.save();
  } catch (err: any) {
    msg.status = OutboundMessageStatus.FAILED;
    msg.error = err.message;
    await msg.save();
  }
}
