import axios from 'axios';

export async function scrapeLinkedInProfiles({
  query,
  limit,
}: {
  query: any;
  limit: number;
}) {
  // Example: Apify Actor
  const APIFY_TASK_ID = process.env.APIFY_TASK_ID || 'REPLACE_WITH_REAL_TASK_ID';
  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  const url = `https://api.apify.com/v2/actor-tasks/${APIFY_TASK_ID}/run-sync-get-dataset-items`;
  const res = await axios.post(
    url,
    {
      searchKeywords: query.keywords,
      titles: query.titles,
      locations: query.locations,
      companySize: query.companySize,
      maxResults: limit,
    },
    {
      params: { token: APIFY_TOKEN },
    }
  );

  return res.data; // normalized profiles
}
