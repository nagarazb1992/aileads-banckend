import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function scrapeLinkedInProfilesAI({ query, limit }: { query: any; limit: number }) {
  // Use OpenAI to generate realistic, company-based emails for each lead
  const prompt = `Generate ${limit} realistic LinkedIn lead profiles as JSON array. Each profile should have:
  - name
  - email (use realistic company-based format, e.g. john.smith@companydomain.com)
  - emailStatus (VALID/INVALID/UNKNOWN)
  - linkedin_url
  - title
  - company
  - companyDomain
  - location
  - profileUrl
  - (include these search criteria): ${JSON.stringify(query)}
Return only a JSON array of objects, no explanation.`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    // response_format removed: instruct model in prompt to return JSON
    temperature: 0.4,
  });

  // Parse the JSON array from the response
  let leads = [];
  try {
    const parsed = JSON.parse(res?.choices?.[0]?.message?.content ?? '[]');
    if (Array.isArray(parsed)) {
      leads = parsed;
    } else if (parsed && Array.isArray(parsed.leads)) {
      leads = parsed.leads;
    } else if (parsed && typeof parsed === 'object') {
      leads = [parsed];
    }
  } catch (e) {
    console.error('[AI] Failed to parse OpenAI leads response:', e);
  }
  return leads;
}
