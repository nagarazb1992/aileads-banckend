import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function analyzeInboundMessage(text: string) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Classify reply sentiment and summarize.' },
      { role: 'user', content: text }
    ]
  });
  return JSON.parse(res.choices[0].message.content);
}
