export function icpToLinkedinQuery(icp: any) {
  return {
    titles: icp.roles,
    industries: icp.industries,
    locations: icp.locations,
    company_size: icp.companySize,
    keywords: icp.keywords.join(' OR ')
  };
}
