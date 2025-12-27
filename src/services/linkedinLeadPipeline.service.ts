
import { buildLinkedInQueryFromICP } from './linkedinQueryAI.service.js';
import { scrapeLinkedInProfiles } from './linkedinScraper.service.js';
import { verifyEmail } from './emailVerification.service.js';
import { calculateICPScore } from './icpMatch.service.js';
import { calculateLeadQuality } from './leadQuality.service.js';
import { consumeCredits } from './credit.service.js';
import { Lead } from '../models/lead.model.js';

export async function runLinkedInICPScrape({
  orgId,
  icp,
  limit,
}: any) {
  const query = await buildLinkedInQueryFromICP(icp);

  const profiles = await scrapeLinkedInProfiles({
    query,
    limit,
  });

  for (const p of profiles) {
    if (!p.email) continue;

    const exists = await Lead.findOne({
      where: { org_id: orgId, email: p.email },
    });
    if (exists) continue;

    const emailCheck = await verifyEmail(p.email);
    if (!emailCheck.isValid) continue;

    const icpScore = calculateICPScore(p.title);

    const lead = await Lead.create({
      org_id: orgId,
      name: p.name,
      email: p.email,
      company: p.company,
      linkedin_url: p.profileUrl,
      source: 'LINKEDIN_SCRAPE',
      icp_score: icpScore,
      confidence_score: 70,
      email_verified: true,
    });

    lead.setDataValue('lead_quality_score', calculateLeadQuality({
      icpScore,
      buyingIntentScore: 60,
      confidenceScore: 70,
      emailVerified: true,
    }));

    await lead.save();

    // 💰 Charge only on success
    await consumeCredits({
      orgId,
      amount: 3,
      reason: 'linkedin_scrape_lead',
      referenceId: lead.getDataValue('id'),
    });
  }
}
