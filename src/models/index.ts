
import sequelize from '../config/database.js';

import { User } from './User.js';
import { Organization } from './Organization.js';
import { Membership } from './membership.model.js';
import { Plan } from './Plan.js';
import { Subscription } from './Subscription.js';
import { CreditWallet } from './creditWallet.model.js';
import { CreditTransaction } from './creditTransaction.model.js';
import { Lead } from './lead.model.js';
import { LinkedInScrapeJob } from './LinkedinScrapeJob.js';
import { LeadCostLog } from './leadCostLog.model.js';
import { LeadFilter } from './LeadFilter.js';
import { Campaign } from './campaign.model.js';
import { CampaignStep } from './campaignStep.model.js';
import { CampaignLead } from './campaignLead.model.js';
import { OutreachMessage } from './outreachMessage.model.js';

import { Sequence, associateSequenceModels } from './Sequence.js';
import { SequenceStep, associateSequenceStepModels } from './SequenceStep.js';
import { EmailTemplate } from './EmailTemplate.js';
// After all models are imported and initialized
(async () => { await associateSequenceModels(); associateSequenceStepModels(); })();

// Register LinkedInScrapeJob model
LinkedInScrapeJob.initModel(sequelize);

/* ---- RELATIONS ---- */
// Subscription & Plan
Subscription.belongsTo(Plan, { foreignKey: 'plan_id' });

// Org & Auth
Organization.belongsTo(Plan);
Organization.hasMany(Membership);
Membership.belongsTo(User);
Membership.belongsTo(Organization);

// Billing
Organization.hasOne(CreditWallet);
CreditWallet.belongsTo(Organization);
CreditWallet.hasMany(CreditTransaction);

// Leads
Organization.hasMany(Lead);
Lead.belongsTo(Organization);
Lead.belongsTo(LeadFilter);

// Cost
Lead.hasMany(LeadCostLog);
Organization.hasMany(LeadCostLog);

// Campaign
Campaign.belongsTo(Organization);
Campaign.hasMany(CampaignStep);
Campaign.hasMany(CampaignLead);
CampaignLead.belongsTo(Lead);

// Outreach
OutreachMessage.belongsTo(Lead);
OutreachMessage.belongsTo(Campaign);

export {
  sequelize,
  User,
  Organization,
  Membership,
  Plan,
  Subscription,
  CreditWallet,
  CreditTransaction,
  Lead,
  LeadCostLog,
  LeadFilter,
  Campaign,
  CampaignStep,
  CampaignLead,
  OutreachMessage,
  LinkedInScrapeJob,
  Sequence,
  SequenceStep,
  EmailTemplate,
};
