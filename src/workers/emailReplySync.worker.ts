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



    // Use IMAP host/port/secure from env if present, else fallback to account fields
    const imapHost = process.env.IMAP_HOST ? process.env.IMAP_HOST : (account.smtp_host || 'localhost');
    const imapPort = process.env.IMAP_PORT ? parseInt(process.env.IMAP_PORT) : (account.imap_port || 993);
    const imapSecure = process.env.IMAP_SECURE ? process.env.IMAP_SECURE === 'true' : true;
    console.log('Connecting to IMAP:', {
      user: account.smtp_user,
      host: imapHost,
      port: imapPort,
      tls: imapSecure === 'true',
      tlsOptions: { rejectUnauthorized: false }
    });

    const imap = new Imap({
      user: account.smtp_user,
      password: decrypt(account.smtp_password_encrypted),
      host: imapHost,
      port: imapPort,
      tls: imapSecure,
      tlsOptions: { rejectUnauthorized: false } // Allow self-signed certs
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
