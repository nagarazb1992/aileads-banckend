import { Campaign } from "../models/campaign.model.js";
import { CampaignLead } from "../models/CampaignLead.js";
import { EmailLog } from "../models/EmailLog.js";
import { SequenceStep } from "../models/SequenceStep.js";


export async function scheduleCampaignEmails(campaignId: string) {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) return;

  console.log('Scheduling emails for campaign:', campaignId);

  const steps = await SequenceStep.findAll({
    where: { sequence_id: campaign.sequence_id },
    order: [['order', 'ASC']]
  });

  console.log('Found steps for campaign:', steps.map(s => s.id));

  const leads = await CampaignLead.findAll({
    where: { campaign_id: campaignId, status: 'ACTIVE' }
  });

  console.log('Found leads for campaign:', leads.map(l => l.lead_id));

  const now = new Date();

  for (const lead of leads) {
    for (const step of steps) {
      const scheduledAt = new Date(
        now.getTime() + step.day_offset * 24 * 60 * 60 * 1000
      );

      console.log("step.day_offset:", step.day_offset);

      console.log(`Scheduling email for lead ${lead.lead_id} at step ${step.order} on ${scheduledAt} with days offset ${step.day_offset}`);

      // 🔐 Idempotency guard
      const exists = await EmailLog.findOne({
        where: {
          campaign_id: campaignId,
          lead_id: lead.lead_id,
          step_order: step.order
        }
      });
      

      if (exists) continue;

      await EmailLog.create({
        campaign_id: campaignId,
        lead_id: lead.lead_id,
        step_order: step.order,
        scheduled_at: scheduledAt,
        status: 'SCHEDULED'
      });
    }
  }
}
