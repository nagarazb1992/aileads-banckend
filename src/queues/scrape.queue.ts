import { Queue, Worker } from 'bullmq';
import { scrapeLead } from '../services/scrape.service.js';

const connection = { host: 'localhost', port: 6379 };

export const scrapeQueue = new Queue('scrape', { connection });

export async function enqueueScrapeJob(data: any) {
  await scrapeQueue.add('bulk_scrape', data);
}

new Worker(
  'scrape',
  async job => {
    const { orgId, urls } = job.data;

    for (const url of urls) {
      await scrapeLead({ orgId, url });
    }
  },
  { connection }
);





