import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type EmailTemplateInput = {
  goal: string;
  targetAudience: string;
  product: string;
  tone?: 'formal' | 'friendly' | 'professional' | 'casual';
  length?: 'short' | 'medium' | 'long';
  callToAction?: string;
};

export async function generateEmailTemplate(
  input: EmailTemplateInput
) {
  const {
    goal,
    targetAudience,
    product,
    tone = 'professional',
    length = 'medium',
    callToAction = 'Would you be open to a quick 15-minute chat?'
  } = input;

  const prompt = `
You are an expert B2B cold email copywriter.

Write a cold email with the following rules:

GOAL:
${goal}

TARGET AUDIENCE:
${targetAudience}

PRODUCT:
${product}

TONE:
${tone}

LENGTH:
${length}

REQUIREMENTS:
- Use ONLY these placeholders:
  {{name}}, {{email}}, {{company}}
- Do NOT invent personal data
- Keep the email spam-safe
- Clear value proposition
- End with a soft CTA

CALL TO ACTION:
${callToAction}

RETURN STRICT JSON ONLY in this format:
{
  "subject": "",
  "body": ""
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.4,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  return JSON.parse(content);
}
