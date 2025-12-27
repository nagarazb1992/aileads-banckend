
import OpenAI from 'openai';
import { Lead } from "../models/lead.model.js";
import { consumeCredits } from "./credit.service.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function enrichLeadAI({
  orgId,
  leadId,
}: {
  orgId: string;
  leadId: string;
}) {
  const lead = await Lead.findByPk(leadId);
  if (!lead) throw new Error('Lead not found');

  try {
    const prompt = `
      Enrich this lead:
      Name: ${lead.getDataValue('name')}
      Email: ${lead.getDataValue('email')}
      Company: ${lead.getDataValue('company')}
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const usage = response.usage;
    const costUsd = calculateCostUsd(usage);
    const credits = Math.ceil(costUsd / 0.01);

    await consumeCredits({
      orgId,
      amount: credits,
      reason: 'ai_enrich',
      referenceId: leadId,
    });

    const choice = response.choices && response.choices[0];
    if (!choice || !choice.message || !choice.message.content) {
      throw new Error('No response from OpenAI');
    }
    lead.setDataValue('enrichedData', choice.message.content);
    await lead.save();
  } catch (err) {
    console.error('AI ENRICH FAILED:', err);
    // ❌ no credits deducted if AI fails
  }
}

function calculateCostUsd(usage: any): number {
  // Example rates (replace with real)
  const inputRate = 0.00015 / 1000;
  const outputRate = 0.0006 / 1000;

  return (
    usage.prompt_tokens * inputRate +
    usage.completion_tokens * outputRate
  );
}
