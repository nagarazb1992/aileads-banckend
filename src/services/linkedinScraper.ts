import axios from 'axios';

export async function scrapeLinkedinProfiles(
  query: any,
  limit: number
): Promise<any[]> {
  const res = await axios.post(
    'https://api.apify.com/v2/acts/apify~linkedin-profile-scraper/run-sync-get-dataset-items',
    {
      search: query,
      maxItems: limit
    },
    {
      params: { token: process.env.APIFY_TOKEN }
    }
  );

  console.log('LinkedIn scrape response data:', res.data);
  return res.data || [];
}
