import { openai } from "../ai/openai.client.js";
import { generateEmail } from "../enrichment/emailPatternLearner.js";
import { generateLinkedInUrl } from "../enrichment/linkedinEnricher.js";
import { rateLimit } from "../infra/rateLimiter.js";
import { withRetry } from "../infra/retry.js";
import { scoreDecisionMaker } from "../scoring/confidenceScorer.js";
import type { DecisionMaker } from "../types/decisionMaker.js";
import { buildDecisionMakerPrompt } from "./decisionMaker.prompt.js";
import { DECISION_MAKER_SCHEMA } from "./decisionMaker.schema.js";


export async function findDecisionMakers(
  company: {
    name: string;
    domain: string;
    industry?: string;
    employeeCount?: number;
  },
  limit = 3
): Promise<DecisionMaker[]> {

  await rateLimit();

  const response = await withRetry(() =>
    openai.responses.create({
      model: 'gpt-4.1-mini',
      temperature: 0.2,
      input: [{
        role: 'user',
        content: buildDecisionMakerPrompt(company, limit),
      }],
      // response_format removed: instruct model in prompt to return JSON
    })
  );

  const parsed = response as any;

  const outputData = extractJsonFromOutput(response.output_text);
// json is now a JS array of objects

  console.log('Raw decision makers from AI:', outputData);
  

  return outputData.map((p: any) => {
    const email = p.email || generateEmail(p.name, company.domain);
    const linkedinUrl = p.linkedinUrl || generateLinkedInUrl(p.name);

    return {
      name: p.name,
      title: p.title,
      email: email.toLowerCase(),
      linkedinUrl,
      confidence: scoreDecisionMaker(p.confidence, p.title),
      source: 'AI_GUESS',
    };
  });
}

function extractJsonFromOutput(output_text: string): any {
  // Remove markdown code block markers if present
  const cleaned = output_text.trim().replace(/^```json|^```|```$/g, '').trim();
  return JSON.parse(cleaned);
}
