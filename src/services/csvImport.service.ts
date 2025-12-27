import fs from 'fs';
import csv from 'csv-parser';
import { CsvImportJob } from '../models/CsvImportJob.js';
import { Lead } from '../models/lead.model.js';

export async function importCsvLeads(
  orgId: string,
  jobId: string,
  mapping: any
) {
  const job = await CsvImportJob.findByPk(jobId);
  if (!job) throw new Error('Invalid job');

  console.log(`Starting CSV import for job ${jobId} and org ${orgId}`);

  // No mapping required; will use CSV column names directly

  const leadPromises: Promise<any>[] = [];
  fs.createReadStream(job.getDataValue('file_path'))
    .pipe(csv())
    .on('data', (row: Record<string, any>) => {
      const promise = (async () => {
        // Use CSV columns directly for Lead fields
        const exists = await Lead.findOne({
          where: { org_id: orgId, linkedinUrl: row.linkedinUrl }
        });
        if (exists) return;
        await Lead.create({
          org_id: orgId,
          organization_id: orgId,
          source: 'CSV',
          fullName: row.fullName,
          email: row.email,
          emailStatus: row.emailStatus || 'UNKNOWN',
          linkedinUrl: row.linkedinUrl,
          jobTitle: row.jobTitle,
          companyName: row.companyName,
          companyDomain: row.companyDomain,
          score: row.score ? parseInt(row.score, 10) : null,
          scoreReason: row.scoreReason,
          priority: row.priority || 'COLD',
          status: row.status || 'NEW',
          buying_intent_score: row.buying_intent_score || null,
          job_id: row.job_id || null,
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
          enriched: row.enriched === 'true' || false,
          meta: row.meta ? JSON.parse(row.meta) : {},
        });
      })();
      leadPromises.push(promise);
    })
    .on('end', async () => {
      await Promise.all(leadPromises);
      await job.update({ status: 'IMPORTED' });
    });
}
