import { Op } from 'sequelize';
import { EmailLog } from '../models/EmailLog.js';
import { Campaign } from '../models/campaign.model.js';
import { CampaignLead } from '../models/CampaignLead.js';
import { Lead } from '../models/lead.model.js';
import { SequenceStep } from '../models/SequenceStep.js';
import { EmailTemplate } from '../models/EmailTemplate.js';
import { EmailAccount } from '../models/EmailAccount.js';
import { sendCampaignEmail } from '../services/emailSender.service.js';

/**
 * Runs every 1 minute
 */
export async function emailSendWorker() {
  // Use 2 minutes back for scheduled_at filter
  const now = new Date(Date.now() - 2 * 60 * 1000);

  // console.log('Email Send Worker running at', now.toISOString());
  const logs = await EmailLog.findAll({
    where: {
      status: 'SCHEDULED',
      scheduled_at: { [Op.lte]: now }
    },
    limit: 50,
    order: [['scheduled_at', 'ASC']]
  });

  // console.log(`Found ${logs.length} emails to send`);

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
          order: log.step_order
        },
        include: [{ model: EmailTemplate, as: 'emailTemplate' }]
      });

      // Debug: log the emailTemplate object
      if (!step || !step.emailTemplate) continue;
      console.log('EmailTemplate for log', log.id, step.emailTemplate);

      // 5️⃣ Fetch email account
      const emailAccount = await EmailAccount.findByPk(
        campaign.email_account_id
      );
      if (!emailAccount || !emailAccount.is_active) continue;

      // console.log("Email account for log", log.id, emailAccount);

   
        const subject = typeof step.emailTemplate.get === 'function' ? step.emailTemplate.get('subject') : step.emailTemplate.subject;
        const body = typeof step.emailTemplate.get === 'function' ? step.emailTemplate.get('body') : step.emailTemplate.body;
        
        // 6️⃣ Send email
        await sendCampaignEmail({
          account: emailAccount,
          to: lead.email,
          subject: render(subject, lead),
          html: render(body, lead)
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
      console.log('EMAIL SENT to', lead.email);

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
function render(template: string | undefined | null, lead: any) {
  if (!template) return '';
  return template
    .replace(/{{name}}/g, lead.name || '')
    .replace(/{{email}}/g, lead.email || '')
    .replace(/{{company}}/g, lead.company || '');
}
