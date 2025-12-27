import { Queue, Worker } from 'bullmq';
import { processOutbound } from '../services/outbound.service.js';

const connection = { host: 'localhost', port: 6379 };

export const outboundQueue = new Queue('outbound', { connection });

export async function enqueueOutbound(data: any) {
  await outboundQueue.add('send', data, {
    delay: 3000, // throttle
  });
}

new Worker(
  'outbound',
  async job => {
    await processOutbound(job.data);
  },
  { connection }
);
