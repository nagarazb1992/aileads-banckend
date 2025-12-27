import { Membership } from '../models/membership.model.js';
import { enqueueAutoLeadJob } from '../queues/autoLead.queue.js';

export async function generateLeads(req: any, res: any) {
  // const { orgId } = req.user;
  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  const { icpDescription,jobRoles, industries, countries, company_size_min,company_size_max, jobLimit } = req.body;

  const jobResult = await enqueueAutoLeadJob({
    orgId,
    icpDescription,
    jobRoles,
    industries,
    countries,
    company_size_min,
    company_size_max,
    jobLimit,
  });

  console.log('enqueueAutoLeadJob result:', jobResult);

  res.json({
    message: 'Automatic lead generation started',
    limit: jobLimit,
    jobResult,
  });
}
