import { Lead } from "../models/lead.model.js";
import { consumeCredits } from "./credit.service.js";

export async function scrapeLead({
  orgId,
  url,
}: {
  orgId: string;
  url: string;
}) {
  try {
    // 🔍 Your scraping logic here
    const data = await fakeScraper(url);

    if (!data?.email) return;

    // Avoid duplicates
    const exists = await Lead.findOne({
      where: { org_id: orgId, email: data.email },
    });
    if (exists) return;

    // Create lead
    const lead = await Lead.create({
      org_id: orgId,
      ...data,
      source: 'scrape',
      organization_id: orgId
    });

    // 💰 Charge ONLY on success
    await consumeCredits({
      orgId,
      amount: 2,
      reason: 'lead_scrape',
      referenceId: lead.getDataValue('id'),
    });
  } catch (err) {
    // ❌ No credits consumed on failure
    console.error('SCRAPE FAILED:', err);
  }
}

async function fakeScraper(url: string) {
  // replace with real scraping logic
  return {
    name: 'John Doe',
    email: `user@${new URL(url).hostname}`,
    company: 'Example Inc',
  };
}
