
import { Lead } from "../models/lead.model.js";
import { Membership } from "../models/membership.model.js";

// Lead status references
export const LEAD_STATUSES = [
  'NEW',
  'QUALIFIED',
  'IN_CAMPAIGN',
  'RESPONDED',
  'FOLLOW_UP_LATER',
  'NOT_INTERESTED',
  'MEETING_BOOKED',
  'CLOSED',
  'WON'
];


export async function getLeadStats(req: any, res: any) {
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;

  console.log('Organization ID for lead stats:', orgId);

  // Get all leads for the org, only select status
  const leads = await Lead.findAll({
    where: { org_id: orgId },
    attributes: ['status'],
    raw: true
  });

  const totalLeads = leads.length;

  // Count by status
  const statusCounts: Record<string, number> = {};
  for (const status of LEAD_STATUSES) {
    statusCounts[status] = 0;
  }
  for (const lead of leads) {
    const status = lead.status;
    if (status && statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }
  }

  // Calculate conversion rate for each status
  const conversionRates: Record<string, number> = {};
  for (const status of LEAD_STATUSES) {
    conversionRates[status] = totalLeads === 0 ? 0 : Number(((statusCounts[status] / totalLeads) * 100).toFixed(1));
  }

  // Optionally, keep the old wonLeads/conversionRate for backward compatibility
  const wonLeads = statusCounts['WON'] || 0;
  const conversionRate = conversionRates['WON'];

  console.log(`Total Leads: ${totalLeads}, Status Counts:`, statusCounts);
  console.log(`Conversion Rates:`, conversionRates);

  res.json({
    totalLeads,
    statusCounts,
    conversionRates,
    wonLeads,
    conversionRate
  });
}
