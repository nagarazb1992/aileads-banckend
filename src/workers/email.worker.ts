import { Op } from 'sequelize';
import { EmailLog } from '../models/EmailLog.js';
import { Campaign } from '../models/campaign.model.js';
import { CampaignLead } from '../models/campaignLead.model.js';
import { Lead } from '../models/lead.model.js';
import { SequenceStep } from '../models/SequenceStep.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { EmailAccount } from '../models/EmailAccount.js';
import { sendCampaignEmail } from '../services/emailSender.service.js';

/**
 * Runs every 1 minute
 */
export async function emailSendWorker() {
  const now = new Date();

  const logs = await EmailLog.findAll({
    where: {
      status: 'SCHEDULED',
      scheduled_at: { [Op.lte]: now }
    },
    limit: 50,
    order: [['scheduled_at', 'ASC']]
  });

  for (const log of logs) {
    try {
      // 1️⃣ Campaign must be running
      const campaign = await Campaign.findByPk(log.campaign_id);
      if (!campaign || campaign.status !== 'RUNNING') continue;

      // 2️⃣ CampaignLead must be active
      const campaignLead = await CampaignLead.findOne({
        where: {
          campaign_id: log.campaign_id,
          lead_id: log.lead_id,
          status: 'ACTIVE'
        }
      });
      if (!campaignLead) continue;

      // 3️⃣ Fetch lead
      const lead = await Lead.findByPk(log.lead_id);
      if (!lead || !lead.email) continue;

      // 4️⃣ Fetch sequence step + template
      const step = await SequenceStep.findOne({
        where: {
          sequence_id: campaign.sequence_id,
          step_order: log.step_order
        },
        include: [EmailTemplate]
      });
      if (!step || !step.EmailTemplate) continue;

      // 5️⃣ Fetch email account
      const emailAccount = await EmailAccount.findByPk(
        campaign.email_account_id
      );
      if (!emailAccount || !emailAccount.is_active) continue;

      // 6️⃣ Send email
      await sendCampaignEmail({
        account: emailAccount,
        to: lead.email,
        subject: render(step.EmailTemplate.subject, lead),
        html: render(step.EmailTemplate.body, lead)
      });

      // 7️⃣ Mark as sent
      await log.update({
        status: 'SENT',
        sent_at: new Date()
      });

      // 8️⃣ Update campaign lead progress
      await campaignLead.update({
        current_step: log.step_order
      });

    } catch (err) {
      console.error('EMAIL SEND FAILED:', err);

      await log.update({
        status: 'FAILED'
      });
    }
  }
}

/**
 * Simple variable replacement
 */
function render(template: string, lead: any) {
  return template
    .replace(/{{name}}/g, lead.name || '')
    .replace(/{{email}}/g, lead.email || '')
    .replace(/{{company}}/g, lead.company || '');
}
