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
You are an expert B2B outbound email copywriter.

Create outbound email copy for a sales sequence.

Context:
- Template name: ${name}
- Topic: ${subject}
- Industry: ${industry}
- CTA tone: ${ctaTone}

STRICT PLACEHOLDER RULES:
- You MUST use ONLY these placeholders:
  {{name}}, {{company}}, {{email}}
- Subject lines MUST include {{company}}
- First line MUST include {{name}}
- Email body MUST reference {{company}}
- Signature MUST include {{email}}

CONTENT RULES:
- Generate EXACTLY 3 subject lines
- Generate EXACTLY 3 email variants
- Professional, friendly, concise
- Industry-appropriate language
- Spam-safe wording
- No emojis
- No markdown
- No CSS
- No images
- HTML must only use: <p>, <br>, <strong>

CTA RULES:
- Soft CTA example: “Open to a quick chat?”
- Direct CTA example: “Can we schedule a 15-minute call this week?”

Return STRICT JSON ONLY:
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
    temperature: 0.6,
    messages: [
      {
        role: "system",
        content:
          "You specialize in high-conversion B2B outbound emails with dynamic personalization.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI response empty");

  const parsed: AICopyResponse = JSON.parse(content);

  /* ================= SAFETY & AUTO-FIX ================= */

  // Ensure exactly 3 subjects
  parsed.subjects = parsed.subjects.slice(0, 3);
  if (!parsed.subjects.some((s) => s.includes("{{company}}"))) {
    parsed.subjects[0] = `Quick idea for {{company}}`;
  }

  // Ensure exactly 3 variants
  parsed.variants = parsed.variants.slice(0, 3);

  parsed.variants = parsed.variants.map((variant) => {
    let text = variant.text.trim();

    // Opening with {{name}}
    if (!text.startsWith("Hi {{name}}")) {
      text = `Hi {{name}},\n\n${text}`;
    }

    // Ensure {{company}} mention
    if (!text.includes("{{company}}")) {
      text = text.replace(
        "Hi {{name}},",
        "Hi {{name}},\n\nI was reviewing how {{company}} approaches this."
      );
    }

    // CTA enforcement
    if (ctaTone === "soft" && !/open to|worth a quick|happy to/i.test(text)) {
      text += "\n\nWould you be open to a quick conversation?";
    }

    if (ctaTone === "direct" && !/schedule|book|call|calendar/i.test(text)) {
      text += "\n\nCan we schedule a 15-minute call this week?";
    }

    // Signature with {{email}}
    if (!text.includes("{{email}}")) {
      text += `\n\nBest regards,\n{{email}}`;
    }

    // Clean HTML conversion
    const html = text
      .split("\n\n")
      .map((p) => `<p>${p}</p>`)
      .join("");

    return { text, html };
  });

  return parsed;
}
