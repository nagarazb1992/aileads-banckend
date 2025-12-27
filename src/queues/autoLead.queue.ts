import { Queue, Worker } from 'bullmq';
import { runAutoLeadGeneration } from '../services/autoLead.service.js';

const connection = { host: 'localhost', port: 6379 };

export const autoLeadQueue = new Queue('auto-leads', { connection });

export async function enqueueAutoLeadJob(data: any) {
  await autoLeadQueue.add('auto_lead_job', data);
}

new Worker(
  'auto-leads',
  async job => {
    await runAutoLeadGeneration(job.data);
  },
  { connection }
);
