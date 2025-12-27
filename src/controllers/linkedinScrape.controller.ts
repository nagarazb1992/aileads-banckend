import { icpToLinkedinQuery } from "../services/icpToLinkedin.js";
import { scrapeLinkedinProfiles } from "../services/linkedinScraper.js";
import { normalizeLinkedinProfile } from "../services/normalizeLead.js";
import { scoreLead } from "../services/leadScoring.js";
import { consumeCredits } from "../services/credit.service.js";
import { v4 as uuid } from "uuid";
import { Lead } from "../models/lead.model.js";
import { Membership } from "../models/membership.model.js";
import { LinkedInScrapeJob, LinkedInScrapeStatus } from "../models/LinkedinScrapeJob.js";
import { scrapeQueue } from "../workers/linkedinScrape.worker.js";
import { calculateLinkedInCredits } from "../utils/credit.util.js";
import { CreditWallet } from "../models/index.js";

export async function scrapeLinkedin(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { icp, limit = 50 } = req.body;

  console.log("Starting LinkedIn scrape for orgId:", orgId);

  if (!icp || !limit) {
    return res.status(400).json({ message: "ICP and limit required" });
  }

  // 1️⃣ Convert ICP → LinkedIn query
  const query = icpToLinkedinQuery(icp);

  console.log("icp", icp)

  console.log("Generated LinkedIn query:", query);

  // 2️⃣ Scrape profiles
  const profiles = await scrapeLinkedinProfiles(query, limit);

  console.log(`Scraped ${profiles.length} profiles from LinkedIn`);

  console.log("Processing profiles and saving new leads...", profiles);

  let added = 0;
  let duplicates = 0;

  for (const profile of profiles) {
    const leadData = normalizeLinkedinProfile(profile, orgId);

    if (!leadData.linkedin_url) continue;

    const exists = await Lead.findOne({
      where: { org_id: orgId, linkedin_url: leadData.linkedin_url },
    });

    if (exists) {
      duplicates++;
      continue;
    }

    const scoring = scoreLead(leadData, icp);

    await Lead.create({
      ...leadData,
      lead_score: scoring.score,
      score_reason: scoring.reason,
    });

    added++;
  }

  // 3️⃣ Consume credits ONLY for new leads
  if (added > 0) {
    await consumeCredits({
      orgId,
      amount: added,
      reason: "linkedin_scrape",
    });
  }

  res.json({
    jobId: `scrape_${uuid().slice(0, 6)}`,
    requested: limit,
    added,
    duplicates,
    creditsUsed: added,
    status: "COMPLETED",
  });
}

export async function startLinkedInScrape(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { mode, icpDescription, salesNavigatorUrl, leadCount } = req.body;

  console.log("orgId", orgId)
  console.log("mode", req.body)

  const creditsNeeded = Math.ceil(leadCount * 0.3);

  // creditGuard already validated balance
  const job = await LinkedInScrapeJob.create({
    orgId: orgId,
    mode,
    icpDescription: icpDescription || null,
    salesNavUrl: salesNavigatorUrl || null,
    requestedLeads: leadCount,
    status: 'QUEUED'
  });


  // enqueue background worker (BullMQ)
  await scrapeQueue.add('linkedinScrape', {
    jobId: job.get('id'),
    orgId
  });

  res.json({
    jobId: job.get('id'),
    status: job.get('status')
  });
}

/**
 * POST /estimate
 */
export async function estimateCredits(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { leadCount } = req.body;

  if (!leadCount || leadCount <= 0) {
    return res.status(400).json({ message: 'Invalid lead count' });
  }

  const estimatedCredits = calculateLinkedInCredits(leadCount);

  const wallet = await CreditWallet.findOne({
    where: { org_id: orgId }
  });

  res.json({
    estimatedCredits,
    leadCount,
    balance: wallet?.get('balance') || 0
  });
}


/**
 * GET /status/:jobId
 */
export async function getScrapeStatus(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { jobId } = req.params;

  const job = await LinkedInScrapeJob.findOne({
    where: { id: jobId, orgId: orgId }
  });

  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  res.json({
    jobId,
    status: job.get('status'),
    processed: job.get('processedLeads'),
    total: job.get('requestedLeads')
  });
}

/**
 * GET /results/:jobId
 */
export async function getScrapeResults(req: any, res: any) {
  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;
  const { jobId } = req.params;

  const job = await LinkedInScrapeJob.findOne({
    where: { id: jobId, orgId: orgId }
  });

  if (!job || job.get('status') !== LinkedInScrapeStatus.COMPLETED) {
    return res.status(400).json({ message: 'Job not completed' });
  }

  const leads = await Lead.findAll({
    where: { org_id: orgId, job_id: jobId }
  });

  res.json({
    jobId,
    leadsCount: leads.length,
    leads
  });
}



