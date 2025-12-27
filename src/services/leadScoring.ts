export function scoreLead(lead: any, icp: any) {
  let score = 0;
  const reasons = [];

  if (icp.roles.includes(lead.role)) {
    score += 25;
    reasons.push('Role matches ICP');
  }

  if (icp.industries.includes(lead.industry)) {
    score += 20;
    reasons.push('Industry match');
  }

  if (lead.linkedin_url) {
    score += 10;
    reasons.push('LinkedIn profile available');
  }

  return {
    score,
    reason: reasons.join(', ')
  };
}
