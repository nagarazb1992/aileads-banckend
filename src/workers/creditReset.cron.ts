import cron from 'node-cron';
import { Subscription } from '../models/Subscription.js';
import { resetCreditsIfNeeded } from '../services/billingCycle.service.js';

export function startCreditResetCron() {
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Credit reset started');

    const activeSubs = await Subscription.findAll({
      where: {
        status: 'ACTIVE',
      },
    });

    for (const sub of activeSubs) {
      await resetCreditsIfNeeded(sub);
    }

    console.log('[CRON] Credit reset finished');
  });
}
