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
    callToAction = 'Would you be open to a quick 15-minute chat?',
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

STRICT PLACEHOLDER RULES:
- Subject MUST include {{company}}
- Opening line MUST include {{name}} and {{company}}
- Signature MUST include {{email}}
- Use ONLY these placeholders:
  {{name}}, {{email}}, {{company}}
- Do NOT invent personal data
- Keep the email spam-safe
- Clear value proposition
- End with a soft CTA

CALL TO ACTION:
${callToAction}

RETURN STRICT JSON ONLY:
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
  if (!content) throw new Error('No response from OpenAI');

  const parsed = JSON.parse(content);

  // 🔒 SAFETY NET
  if (!parsed.subject.includes('{{company}}')) {
    parsed.subject = `Quick idea for {{company}}`;
  }

  if (!parsed.body.includes('{{name}}')) {
    parsed.body = `Hi {{name}},\n\n${parsed.body}`;
  }

  if (!parsed.body.includes('{{company}}')) {
    parsed.body = parsed.body.replace(
      'Hi {{name}},',
      'Hi {{name}},\n\nI was looking into {{company}}'
    );
  }

  if (!parsed.body.includes('{{email}}')) {
    parsed.body += `\n\nBest regards,\n{{email}}`;
  }

  return parsed;
}
