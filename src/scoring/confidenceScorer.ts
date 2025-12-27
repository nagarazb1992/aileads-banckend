import { applyRoleWeight } from '../enrichment/domainRoleWeights.js';
import type { CompanyResult } from '../types/company.js';

export function scoreCompany(
  company: CompanyResult,
  icpIndustries: string[],
  minSize: number,
  maxSize: number
): CompanyResult {

  const breakdown = {
    domain_verified: company.verified_domain ? 30 : 0,
    icp_match: icpIndustries.includes(company.industry) ? 30 : 15,
    size_match:
      company.estimated_size &&
      company.estimated_size >= minSize &&
      company.estimated_size <= maxSize
        ? 20
        : 0,
    linkedin_match: company.linkedin_url ? 20 : 0
  };

  const confidence_score =
    breakdown.domain_verified +
    breakdown.icp_match +
    breakdown.size_match +
    breakdown.linkedin_match;

  return {
    ...company,
    confidence_score,
    confidence_breakdown: breakdown
  };
}

export function normalizeConfidence(value: number) {
  if (value >= 90) return 90;
  if (value >= 80) return 85;
  if (value >= 70) return 75;
  return 65;
}

export function scoreDecisionMaker(
  aiConfidence: number,
  title: string
): number {
  const normalized = normalizeConfidence(aiConfidence);
  return applyRoleWeight(normalized, title);
}

