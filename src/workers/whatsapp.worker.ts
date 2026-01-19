
import { Op, Sequelize } from 'sequelize';
import { Campaign } from '../models/campaign.model.js';
import { Lead } from '../models/lead.model.js';
import { SequenceStep } from '../models/SequenceStep.js';
import { CampaignLead } from '../models/CampaignLead.js';
import { OutboundMessageLog } from '../models/OutboundMessageLog.js';
import { WhatsappAccount } from '../models/WhatsappAccount.js';
import { sendWhatsappMessage } from '../services/whatsapp.service.js';
import { renderTemplate } from '../utils/renderTemplate.js';


export async function whatsappWorker() {
  const steps = await SequenceStep.findAll({
    where: { channel: 'WHATSAPP' }
  });

  for (const step of steps) {
    const campaigns = await Campaign.findAll({
      where: { sequence_id: step.sequence_id, status: 'RUNNING' }
    });

    for (const campaign of campaigns) {
      const leads = await CampaignLead.findAll({
        where: {
          campaign_id: campaign.id,
          status: 'ACTIVE',
          current_step: step.order - 1
        }
      });

      for (const cl of leads) {
        const exists = await OutboundMessageLog.findOne({
          where: {
            campaign_id: campaign.id,
            lead_id: cl.lead_id,
            channel: 'WHATSAPP',
            step_order: step.order
          }
        });
        if (exists) continue;

        const lead = await Lead.findByPk(cl.lead_id);
        if (!lead?.phone) continue;

        const account = await WhatsappAccount.findOne({
          where: {
            org_id: campaign.org_id,
            is_active: true,
            sent_today: { [Op.lt]: Sequelize.col('daily_limit') }
          }
        });
        if (!account) continue;

        try {
          await sendWhatsappMessage({
            to: lead.phone,
            message: renderTemplate(step.message, lead)
          });

          await OutboundMessageLog.create({
            org_id: campaign.org_id,
            campaign_id: campaign.id,
            lead_id: lead.id,
            channel: 'WHATSAPP',
            step_order: step.order,
            status: 'SENT'
          });

          await account.increment('sent_today');
          await cl.update({ current_step: step.order });
        } catch (err: any) {
          await OutboundMessageLog.create({
            org_id: campaign.org_id,
            campaign_id: campaign.id,
            lead_id: lead.id,
            channel: 'WHATSAPP',
            step_order: step.order,
            status: 'FAILED',
            error: err.message
          });
        }
      }
    }
  }
}

