import { CampaignLead } from "../models/CampaignLead.js";
import { SequenceStep } from "../models/SequenceStep.js";
import { emailQueue } from "../queues/email.queue.js";

export async function enqueueCampaignEmails(
  campaignId: string,
  orgId: string,
  sequence_id: string
) {
  const campaignLeads = await CampaignLead.findAll({
    where: {
      campaign_id: campaignId,
      status: "ACTIVE",
    },
  });

  for (const cl of campaignLeads) {
    // Step 1 of sequence
    const step = await SequenceStep.findOne({
      where: {
        sequence_id: sequence_id,
      },
    });

    if (!step) {
      console.warn(
        "[ENQUEUE EMAILS] No step found for sequence_id:",
        sequence_id
      );
      continue;
    }

    await emailQueue.add(
      "sendEmail",
      {
        campaignId,
        leadId: cl.lead_id,
        stepOrder: 1,
        subject: step.subject,
        body: step.message,
      },
      {
        delay: (step.day_offset || 0) * 24 * 60 * 60 * 1000,
      }
    );
  }
}
