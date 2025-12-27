import OpenAI from 'openai';
import { Lead } from '../models/lead.model.js';
import { consumeCredits } from './credit.service.js';


const apiKey = process.env.OPENAI_KEY;
if (!apiKey) throw new Error('OPENAI_KEY is not set');
const openai = new OpenAI({ apiKey });

export async function scoreLeadICP({
  orgId,
  leadId,
  icpDescription,
}: {
  orgId: string;
  leadId: string;
  icpDescription: string;
}) {
  const lead = await Lead.findByPk(leadId);
  if (!lead) throw new Error('Lead not found');

  const prompt = `
You are a B2B sales analyst.

ICP:
${icpDescription}

Lead:
Name: ${lead.getDataValue('name')}
Email: ${lead.getDataValue('email')}
Company: ${lead.getDataValue('company')}

Return JSON only:
{
  "score": number (0-100),
  "reason": string
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    // response_format removed: instruct model in prompt to return JSON
  });

  const choice = response.choices && response.choices[0];
  if (!choice || !choice.message || !choice.message.content) {
    throw new Error('No response from OpenAI');
  }
  const output = JSON.parse(choice.message.content);

  // 💰 Dynamic credit cost
  const costUsd = calculateCost(response.usage);
  const credits = Math.ceil(costUsd / 0.01);

  await consumeCredits({
    orgId,
    amount: credits,
    reason: 'icp_scoring',
    referenceId: leadId,
  });

  lead.setDataValue('icp_score', output.score);
  lead.setDataValue('icp_reason', output.reason);
  await lead.save();

  return output;
}

function calculateCost(usage: any): number {
  const input = usage.prompt_tokens * 0.00015 / 1000;
  const output = usage.completion_tokens * 0.0006 / 1000;
  return input + output;
}
