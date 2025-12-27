import OpenAI from 'openai';
import { normalizeConfidence } from '../scoring/confidenceScorer.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

type DecisionMaker = {
  name: string;
  title: string;
  email: string;
  linkedinUrl: string;
  confidence: number;
  source: 'AI_GUESS';
};

export async function findDecisionMakers(
  company: {
    name: string;
    domain: string;
    industry?: string;
    employeeCount?: number;
  },
  limit = 3
): Promise<DecisionMaker[]> {

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    input: [{
      role: 'user',
      content: `
You are a B2B sales intelligence assistant.

Company:
- Name: ${company.name}
- Domain: ${company.domain}
- Industry: ${company.industry || 'Unknown'}
- Employees: ${company.employeeCount || 'Unknown'}

Generate up to ${limit} senior decision makers.

Return only JSON.
`
    }],
    response_format: {
      type: 'json_schema',
      json_schema: {
        type: 'object',
        properties: {
          decision_makers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                title: { type: 'string' },
                email: { type: 'string' },
                linkedinUrl: { type: 'string' },
                confidence: { type: 'number' }
              },
              required: ['name', 'title', 'email', 'linkedinUrl', 'confidence'],
              additionalProperties: false
            }
          }
        },
        required: ['decision_makers'],
        additionalProperties: false
      }
    }
  });

  const raw = response.output_parsed as any;

  const cleaned: DecisionMaker[] = raw.decision_makers
    .filter((p: any) =>
      isValidEmail(p.email, company.domain) &&
      isValidLinkedIn(p.linkedinUrl)
    )
    .map((p: any) => ({
      name: p.name,
      title: p.title,
      email: p.email.toLowerCase(),
      linkedinUrl: p.linkedinUrl,
      confidence: normalizeConfidence(p.confidence),
      source: 'AI_GUESS'
    }));

  return cleaned.slice(0, limit);
}
