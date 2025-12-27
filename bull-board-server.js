import express from 'express';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter.js';
import { emailQueue } from './src/queues/email.queue.js';

const app = express();
const port = 3050;

const { router } = createBullBoard([
  new BullAdapter(emailQueue)
]);

app.use('/admin/queues', router);

app.listen(port, () => {
  console.log(`Bull Board running at http://localhost:${port}/admin/queues`);
});
