import { getCached, setCached } from "../cache/icpCache.js";
import { verifyDomain } from "../enrichment/domainVerifier.js";
import { generateLinkedInUrl } from "../enrichment/linkedinEnricher.js";
import { estimateCompanySize } from "../enrichment/sizeEstimator.js";
import { scoreCompany } from "../scoring/confidenceScorer.js";
import type { CompanyResult } from "../types/company.js";
import { hashICP } from "../utils/hashICP.js";
import { COMPANY_SCHEMA } from "./company.schema.js";
import { openai } from "./openai.client.js";


export async function findCompaniesFromICP(
  icpDescription: string,
  industries: string[],
  countries: string[],
  minSize: number,
  maxSize: number,
  limit: number
): Promise<CompanyResult[]> {

  const cacheKey = hashICP({ icpDescription, industries, countries, minSize, maxSize, limit });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await openai.responses.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    input: [{
      role: 'user',
      content: `
Find real companies matching this ICP:

${icpDescription}

Industries: ${industries.join(', ')}
Countries: ${countries.join(', ')}
`
    }],
    // response_format removed: instruct model in prompt to return JSON
  });

  const companies = (res.output_parsed as any).companies as CompanyResult[];

  const results: CompanyResult[] = [];

  for (const c of companies) {
    if (!(await verifyDomain(c.domain))) continue;

    const enriched: CompanyResult = {
      ...c,
      verified_domain: true,
      estimated_size: estimateCompanySize(c.industry),
      linkedin_url: generateLinkedInUrl(c.name)
    };

    results.push(
      scoreCompany(enriched, industries, minSize, maxSize)
    );

    if (results.length >= limit) break;
  }

  setCached(cacheKey, results);
  return results;
}
