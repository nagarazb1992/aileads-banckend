import cron from 'node-cron';
import { verifyEmail } from '../services/emailVerification.service.js';
import { detectBuyingIntent } from '../services/buyingIntent.service.js';
import { calculateLeadQuality } from '../services/leadQuality.service.js';
import { Lead } from '../models/lead.model.js';
import { Op } from 'sequelize';

cron.schedule('0 2 * * *', async () => {
  const staleLeads = await Lead.findAll({
    where: {
      last_enriched_at: {
        [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  for (const lead of staleLeads) {
    const emailCheck = await verifyEmail(lead.getDataValue('email'));
    if (!emailCheck.isValid) continue;

    const intent = await detectBuyingIntent({
      name: lead.getDataValue('company'),
    });

    lead.setDataValue('buying_intent_score', intent.getDataValue('intentScore'));
    lead.setDataValue('lead_quality_score', calculateLeadQuality({
      icpScore: lead.getDataValue('icp_score'),
      buyingIntentScore: intent.getDataValue('intentScore'),
      confidenceScore: lead.getDataValue('confidence_score'),
      emailVerified: true,
    }));

    lead.setDataValue('last_enriched_at', new Date());
    await lead.save();
  }
});
