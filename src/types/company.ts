export interface CompanyResult {
  name: string;
  domain: string;
  country: string;
  industry: string;

  linkedin_url?: string;
  estimated_size?: number;
  verified_domain?: boolean;

  confidence_score?: number; // 0–100
  confidence_breakdown?: ConfidenceBreakdown;
}

export interface ConfidenceBreakdown {
  domain_verified: number;
  icp_match: number;
  size_match: number;
  linkedin_match: number;
}
