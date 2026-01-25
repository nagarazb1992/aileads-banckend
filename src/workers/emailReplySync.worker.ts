import Imap from 'imap';
import { simpleParser } from 'mailparser';
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



    // Use IMAP host/port/secure from env if present, else fallback to account fields
    const imapHost = account.imap_host;
    const imapPort = account.imap_port ;
    const imapSecure = account.imap_secure;
    const imapUser = account.imap_user;
    const imapPassword = account.imap_password_encrypted ? decrypt(account.imap_password_encrypted) : undefined;

    const imap = new Imap({
      user: imapUser,
      password: imapPassword,
      host: imapHost,
      port: imapPort,
      tls: imapSecure,
      tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
      console.log('IMAP connected successfully:', imapUser, imapHost, imapPort);
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN'], (err, results) => {
          if (!results || results.length === 0) {
            imap.end();
            return;
          }

          const fetcher = imap.fetch(results, { bodies: '' });

          fetcher.on('message', msg => {
            msg.on('body', async stream => {
              try {
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
              } catch (err) {
                console.error('Error processing email reply:', err);
              }
            });
          });

          fetcher.once('end', () => imap.end());
        });
      });
    });

    imap.once('error', (err) => {
      console.error('IMAP connection error:', err);
    });

    try {
      imap.connect();
    } catch (err) {
      console.error('IMAP connect threw error:', err);
    }
  }
}
