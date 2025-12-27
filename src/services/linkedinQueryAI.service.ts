import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function buildLinkedInQueryFromICP(icp: any) {
  const prompt = `
Convert this ICP into a LinkedIn people search logic.

ICP:
${JSON.stringify(icp)}

Return JSON only:
{
  "keywords": "",
  "titles": [],
  "locations": [],
  "companySize": ""
}
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    // response_format removed: instruct model in prompt to return JSON
    temperature: 0.2,
  });

  return JSON.parse(res?.choices?.[0]?.message?.content ?? '{}');
}
