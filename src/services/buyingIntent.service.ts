import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function detectBuyingIntent(company: {
  name: string;
  industry?: string;
  description?: string;
}) {
  const prompt = `
Analyze buying intent for this company.

Company:
${JSON.stringify(company)}

Return JSON only:
{
  "intentScore": number (0-100),
  "signals": string[]
}
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    // response_format removed: instruct model in prompt to return JSON
    temperature: 0.2,
  });

  return JSON.parse(res.choices?.[0]?.message?.content ?? '{}');
}
