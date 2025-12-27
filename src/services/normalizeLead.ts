export function normalizeLinkedinProfile(profile: any, orgId: string) {
  const [firstName, ...rest] = (profile.fullName || '').split(' ');

  return {
    org_id: orgId,
    first_name: firstName || null,
    last_name: rest.join(' ') || null,
    email: profile.email || null,
    phone: null,
    company: profile.companyName || null,
    role: profile.jobTitle || null,
    linkedin_url: profile.profileUrl,
    country: profile.location || null,
    source: 'linkedin_scrape',
    status: 'NEW'
  };
}
