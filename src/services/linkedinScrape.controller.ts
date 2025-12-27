import csv from 'csv-parser';
import fs from 'fs';
import { verifyEmail } from './emailVerification.service.js';
import { calculateICPScore } from './icpMatch.service.js';
import { calculateLeadQuality } from './leadQuality.service.js';
import { consumeCredits } from './credit.service.js';
import { Lead } from '../models/lead.model.js';

export async function importSalesNavCSV(
  orgId: string,
  filePath: string
) {
  const results: any[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data: any) => results.push(data))
    .on('end', async () => {
      for (const row of results) {
        if (!row.Email) continue;

        const exists = await Lead.findOne({
          where: { org_id: orgId, email: row.Email },
        });
        if (exists) continue;

        const emailCheck = await verifyEmail(row.Email);
        if (!emailCheck.isValid) continue;

        const icpScore = calculateICPScore(row.Title);

        const lead = await Lead.create({
          org_id: orgId,
          name: row['Full Name'],
          email: row.Email,
          company: row.Company,
          linkedin_url: row['LinkedIn URL'],
          source: 'SALES_NAV_CSV',
          icp_score: icpScore,
          confidence_score: 75,
          email_verified: true,
        });

        lead.setDataValue('score', calculateLeadQuality({
          icpScore,
          buyingIntentScore: 60,
          confidenceScore: 75,
          emailVerified: true,
        }));

        await lead.save();

        await consumeCredits({
          orgId,
          amount: 2,
          reason: 'sales_nav_import',
          referenceId: lead.getDataValue('id'),
        });
      }
    });
}
