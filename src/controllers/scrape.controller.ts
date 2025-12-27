import { Membership } from '../models/membership.model.js';
import { enqueueScrapeJob } from '../queues/scrape.queue.js';

export async function bulkScrape(req: any, res: any) {

  // const { orgId } = req.user;
  const { urls } = req.body;

  const membership = await Membership.findOne({ where: { user_id: req.user.userId } });
  let orgId = membership ? membership.getDataValue('organization_id') : undefined;
  console.log('BULK SCRAPE REQ USER:', orgId);
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ message: 'URLs required' });
  }

  // Hard limit per request (protect infra)
  if (urls.length > 1000) {
    return res.status(400).json({ message: 'Max 1000 URLs per request' });
  }

  await enqueueScrapeJob({
    orgId,
    urls,
  });

  res.json({
    message: 'Scrape started',
    total: urls.length,
  });
}
