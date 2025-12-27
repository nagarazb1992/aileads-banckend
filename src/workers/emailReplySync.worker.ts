import Imap from 'imap';
import { EmailAccount } from '../models/EmailAccount.js';
import { decrypt } from '../utils/crypto.js';
import { Lead } from '../models/lead.model.js';
import { CampaignLead } from '../models/campaignLead.model.js';

/**
 * Runs every 2–5 minutes
 */
export async function replySyncWorker() {
  const accounts = await EmailAccount.findAll({
    where: {
      is_active: true
    }
  });

  for (const account of accounts) {
    if (account.provider !== 'SMTP') continue;

    const imap = new Imap({
      user: account.smtp_user,
      password: decrypt(account.smtp_password_encrypted),
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    });

    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN'], (err, results) => {
          if (!results || results.length === 0) {
            imap.end();
            return;
          }

          const fetcher = imap.fetch(results, { bodies: '' });

          fetcher.on('message', msg => {
            msg.on('body', async stream => {
              const parsed = await simpleParser(stream);
              const fromEmail = parsed.from?.value[0]?.address;
              if (!fromEmail) return;

              // Find lead
              const lead = await Lead.findOne({
                where: { email: fromEmail.toLowerCase() }
              });
              if (!lead) return;

              // Stop all active campaign leads
              await CampaignLead.update(
                { status: 'REPLIED' },
                {
                  where: {
                    lead_id: lead.id,
                    status: 'ACTIVE'
                  }
                }
              );

              console.log('Reply detected, sequence stopped:', fromEmail);
            });
          });

          fetcher.once('end', () => imap.end());
        });
      });
    });

    imap.connect();
  }
}
