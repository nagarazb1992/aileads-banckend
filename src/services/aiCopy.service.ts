import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

type CTATone = "soft" | "direct";

interface EmailVariant {
  text: string;
  html: string;
}

interface AICopyResponse {
  subjects: string[];
  variants: EmailVariant[];
}

export async function generateAICopy({
  name,
  subject,
  industry = "Generic",
  ctaTone = "soft",
}: {
  name: string;
  subject: string;
  industry?: string;
  ctaTone?: CTATone;
}): Promise<AICopyResponse> {
  const prompt = `
Create outbound email copy for a sales sequence.

Context:
- Template name: ${name}
- Topic: ${subject}
- Industry: ${industry}
- CTA tone: ${ctaTone}

Instructions:
1. Generate 3 subject lines (short, non-spammy)
2. Generate 3 email variants
3. Each variant must include:
   - Plain text version
   - Simple HTML version (no CSS, no images)
4. Emails must:
   - Be generic (no recipient names)
   - Match the intent of the template
   - Use industry-appropriate language
   - Be professional, friendly, and concise
   - End with a ${ctaTone} CTA
5. Do NOT use placeholders like {{name}}

Return response strictly in JSON with this structure:
{
  "subjects": ["...", "...", "..."],
  "variants": [
    { "text": "...", "html": "..." },
    { "text": "...", "html": "..." },
    { "text": "...", "html": "..." }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert B2B outbound email copywriter with deep industry knowledge.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI response empty");
  }

  return JSON.parse(content);
}
