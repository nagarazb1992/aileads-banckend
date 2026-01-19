import axios from 'axios';

export async function runLinkedinTask(input: any) {
  const res = await axios.post(
    'https://api.apify.com/v2/acts/YOUR_ACTOR_ID/run-sync',
    input,
    { params: { token: process.env.APIFY_TOKEN } }
  );
  return res.data;
}
