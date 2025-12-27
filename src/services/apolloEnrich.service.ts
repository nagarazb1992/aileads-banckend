import axios from 'axios';

const APOLLO_API_KEY = process.env.APOLLO_API_KEY;
const APOLLO_API_URL = 'https://api.apollo.io/v1/mixed_people/search';

/**
 * Enrich a lead using Apollo.io API.
 * @param {Object} params - { name, company, linkedinUrl, email }
 * @returns {Promise<Object|null>} - Returns enriched lead data or null if not found.
 */
export async function enrichWithApollo({ name, company, linkedinUrl, email }) {
  if (!APOLLO_API_KEY) throw new Error('APOLLO_API_KEY is not set in environment');

  const filters = {};
  if (linkedinUrl) filters.linkedin_url = linkedinUrl;
  if (email) filters.email = email;
  if (name) filters.name = name;
  if (company) filters.organization_name = company;

  try {
    const res = await axios.post(
      APOLLO_API_URL,
      {
        q_organization_domains: [],
        person_titles: [],
        person_locations: [],
        page: 1,
        per_page: 1,
        ...filters,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_API_KEY,
        },
      }
    );
    if (res.data && res.data.people && res.data.people.length > 0) {
      return res.data.people[0];
    }
    return null;
  } catch (err) {
    console.error('[Apollo] Enrichment error:', err?.response?.data || err);
    return null;
  }
}
