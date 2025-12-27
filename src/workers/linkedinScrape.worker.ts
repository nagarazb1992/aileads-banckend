
import { Queue, Worker } from 'bullmq';
import { LinkedInScrapeJob, LinkedInScrapeStatus } from '../models/LinkedinScrapeJob.js';
import { Lead } from '../models/lead.model.js';
import { CreditWallet } from '../models/creditWallet.model.js';
import { Op } from 'sequelize';
  // Real LinkedIn scraping logic
  const { LinkedInScrapeMode } = await import('../models/LinkedinScrapeJob.js');
  const { scrapeLinkedInProfilesAI } = await import('../services/linkedinScraperAI.service.js');
  const { buildLinkedInQueryFromICP } = await import('../services/linkedinQueryAI.service.js');

const connection = { host: 'localhost', port: 6379 };

export const scrapeQueue = new Queue('linkedinScrape', { connection });

new Worker(
  'linkedinScrape',
  async (job) => {
    const { jobId, orgId } = job.data;
    console.log(`[Worker] Received job: jobId=${jobId}, orgId=${orgId}`);
    try {
      const scrapeJob = await LinkedInScrapeJob.findByPk(jobId);
      if (!scrapeJob) {
        console.error(`[Worker] No LinkedInScrapeJob found for jobId=${jobId}`);
        return;
      }
      await scrapeJob.update({ status: LinkedInScrapeStatus.RUNNING });

      let leads = [];
      if (scrapeJob.get('mode') === LinkedInScrapeMode.ICP && scrapeJob.get('icpDescription')) {
        let icp;
        try {
          icp = JSON.parse(scrapeJob.get('icpDescription'));
        } catch (parseErr) {
          icp = { description: scrapeJob.get('icpDescription') };
          console.warn(`[Worker] icpDescription is not JSON, using as plain string for jobId=${jobId}`);
        }
        const query = await buildLinkedInQueryFromICP(icp);
        leads = await scrapeLinkedInProfilesAI({ query, limit: scrapeJob.get('requestedLeads') });
      } else if (scrapeJob.get('mode') === LinkedInScrapeMode.SALES_NAV && scrapeJob.get('salesNavUrl')) {
        leads = await scrapeLinkedInProfilesAI({ query: { salesNavUrl: scrapeJob.get('salesNavUrl') }, limit: scrapeJob.get('requestedLeads') });
      }
      console.log(`[Worker] Scraped ${leads.length} leads for jobId=${jobId}`);

      // If OpenAI response is wrapped in { profiles: [...] } or similar, unwrap it
      if (Array.isArray(leads)) {
        // OK
      } else if (leads && Array.isArray(leads.profiles)) {
        leads = leads.profiles;
      } else if (leads && Array.isArray(leads.leads)) {
        leads = leads.leads;
      } else {
        console.warn('[Worker] Unexpected leads format from AI:', leads);
        leads = [];
      }

      let created = 0;
      for (const profile of leads) {
        // If profile.meta is an array, iterate and save each
        const metaArray = Array.isArray(profile.meta) ? profile.meta : [profile];
        for (const meta of metaArray) {
          const profilesArray = Array.isArray(meta.profiles) ? meta.profiles : [meta.profiles];
          for (const profile of profilesArray) {
            if (!profile || !profile.linkedin_url || !profile.name) {
              console.warn(`[Worker] Skipping invalid/fake lead: missing linkedinUrl or fullName`, profile);
              continue;
            }
            let leadData = {
              org_id: orgId,
              organization_id: orgId,
              fullName: profile.name || profile.fullName,
              email: profile.email,
              emailStatus: profile.emailStatus || 'UNKNOWN',
              linkedinUrl: profile.linkedin_url || profile.linkedinUrl || profile.profileUrl,
              jobTitle: profile.title || profile.jobTitle,
              companyName: profile.company || profile.companyName,
              companyDomain: profile.companyDomain,
              source: 'linkedin_scrape',
              job_id: jobId,
              meta: profile,
            };
            console.log(`[Worker] Final leadData to save:`, profile);
            // Only include defined values in the OR query
            const orConditions = [];
            if (profile.email) orConditions.push({ email: profile.email });
            if (profile.linkedin_url) orConditions.push({ linkedinUrl: profile.linkedin_url });
            let exists = null;
            if (orConditions.length > 0) {
              exists = await Lead.findOne({
                where: {
                  org_id: orgId,
                  [Op.or]: orConditions
                }
              });
            }
            if (exists) continue;
            await Lead.create(leadData);
            created++;
          }
        }
        }
      
      console.log(`[Worker] Created ${created} new leads for jobId=${jobId}`);

      const wallet = await CreditWallet.findOne({ where: { organization_id: orgId } });
      if (wallet && typeof wallet.get('balance') === 'number') {
        await wallet.update({ balance: wallet.get('balance') - Math.ceil(created * 0.3) });
      }

      await scrapeJob.update({
        status: LinkedInScrapeStatus.COMPLETED,
      });
      console.log(`[Worker] Job completed: jobId=${jobId}`);
    } catch (err) {
      console.error(`[Worker] Error processing jobId=${job?.data?.jobId}:`, err);
      if (jobId) {
        await LinkedInScrapeJob.update({ status: LinkedInScrapeStatus.FAILED }, { where: { id: jobId } });
      }
    }
  },
  { connection }
);
