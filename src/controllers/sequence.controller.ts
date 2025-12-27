import sequelize from "../config/database.js";
import { Lead, Membership } from "../models/index.js";
import { Sequence } from "../models/Sequence.js";
import { SequenceStep } from "../models/SequenceStep.js";
import { sendCampaignEmail } from "../services/email.service.js";

export async function createSequence(req: any, res: any) {
  const { name, autoStopOnReply, steps } = req.body;

  console.log("CREATE SEQUENCE REQ BODY:", steps);

  const membership = await Membership.findOne({
    where: { user_id: req.user.userId },
  });
  let orgId = membership
    ? membership.getDataValue("organization_id")
    : undefined;

  if (!name || !steps?.length) {
    return res.status(400).json({ message: "Invalid sequence data" });
  }

  const tx = await sequelize.transaction();

  try {
    // 1️⃣ Create sequence
    const sequence = await Sequence.create(
      {
        org_id: orgId,
        name,
        auto_stop_on_reply: autoStopOnReply ?? true,
        
      },
      { transaction: tx }
    );

    // 2️⃣ Create steps
    for (const step of steps) {
      console.log("CREATING STEP:", typeof(step.dayOffset));
      await SequenceStep.create(
        {
          sequence_id: sequence.id,
          order: step.order,
          day_offset: step.dayOffset,
          channel: typeof step.channel === 'string' ? step.channel.toUpperCase() : step.channel,
          subject: step.subject || null,
          message: step.message,
          email_template_id:step.emailTemplateId || null,
          // email_template_id removed
        },
        { transaction: tx }
      );
    }

    await tx.commit();

    res.status(201).json({
      sequenceId: sequence.id,
      stepsCount: steps.length,
      status: "CREATED",
    });
  } catch (err) {
    await tx.rollback();
    console.error("SEQUENCE CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create sequence" });
  }
}

export async function getSequences(req: any, res: any) {
  try {
    // Defensive: Only parse JSON if content-type is application/json
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      if (req.body && typeof req.body === 'string' && req.body.trim() === '') {
        return res.status(400).json({ message: 'Empty JSON body' });
      }
    }

    const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;

    const sequences = await Sequence.findAll({
      where: { org_id: orgId },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: SequenceStep,
          as: 'steps',
          order: [['order', 'ASC']],
        },
      ],
    });
    res.json(sequences);
  } catch (error) {
    console.error("GET SEQUENCES ERROR:", error);
    res.status(500).json({ message: "Failed to fetch sequences" });
  }
}

export async function getSequenceById(req: any, res: any) {
  try {
    const membership = await Membership.findOne({
      where: { user_id: req.user.userId },
    });
    let orgId = membership
      ? membership.getDataValue("organization_id")
      : undefined;
    const { sequenceId } = req.params;

    const sequence = await Sequence.findOne({
      where: { id: sequenceId, org_id: orgId },
      include: [
        {
          model: SequenceStep,
          as: 'steps',
          order: [['order', 'ASC']],
        },
      ],
    });
    if (!sequence) {
      return res.status(404).json({ message: "Sequence not found" });
    }
    res.json(sequence);
  } catch (error) {
    console.error("GET SEQUENCE BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch sequence" });
  }
}

export async function deleteSequence(req: any, res: any) {
    try {
        const membership = await Membership.findOne({
            where: { user_id: req.user.userId },
        });
        let orgId = membership
            ? membership.getDataValue("organization_id")
            : undefined;
        const sequenceId = req.params.id;
        const sequence = await Sequence.findOne({
            where: { id: sequenceId, org_id: orgId },
        });
        if (!sequence) {
            return res.status(404).json({ message: "Sequence not found" });
        }
        await SequenceStep.destroy({
            where: { sequence_id: sequenceId }
        });
        await Sequence.destroy({
            where: { id: sequenceId, org_id: orgId }
        });
        res.json({ message: "Sequence deleted successfully" });
    }
    catch (error) {
        console.error("DELETE SEQUENCE ERROR:", error);
        res.status(500).json({ message: "Failed to delete sequence" });
    }
}

export async function updateSequence(req: any, res: any) {
    try {
        const membership = await Membership.findOne({
            where: { user_id: req.user.userId },
        });
        let orgId = membership
            ? membership.getDataValue("organization_id")
            : undefined;
        const sequenceId = req.params.id;
        const { name, autoStopOnReply, steps, status } = req.body;
        const sequence = await Sequence.findOne({
            where: { id: sequenceId, org_id: orgId },
        });
        if (!sequence) {
            return res.status(404).json({ message: "Sequence not found" });
        }
        sequence.name = name || sequence.name;
        sequence.auto_stop_on_reply = autoStopOnReply !== undefined ? autoStopOnReply : sequence.auto_stop_on_reply;
        sequence.status = status || sequence.status;
        await sequence.save();
        if (steps && Array.isArray(steps)) {
            await SequenceStep.destroy({
                where: { sequence_id: sequenceId }
            });
            for (const step of steps) {
                await SequenceStep.create({
                    sequence_id: sequence.id,
                    order: step.order,
                    dayOffset: step.dayOffset,
                    channel: typeof step.channel === 'string' ? step.channel.toUpperCase() : step.channel,
                    subject: step.subject || null,
                    message: step.message,
                    email_template_id:step.emailTemplateId || null,
                    // email_template_id removed
                });
            }
        }
        res.json({ message: "Sequence updated successfully" });
    }
    catch (error) {
        console.error("UPDATE SEQUENCE ERROR:", error);
        res.status(500).json({ message: "Failed to update sequence" });
    }
}

export async function previewEmail(req:any, res:any) {
  const { sequenceId } = req.params;
  const { leadId } = req.body;

  const step = await SequenceStep.findOne({
    where: { sequence_id: sequenceId, step_order: 1 }
  });

  const lead = await Lead.findByPk(leadId);

  if (!step || !lead) {
    return res.status(404).json({ message: 'Invalid data' });
  }

  const previewHtml = step.body.replace('{{name}}', lead.name);

  res.json({
    subject: step.subject,
    html: previewHtml
  });
}

export async function testSendEmail(req:any, res:any) {
  const { sequenceId } = req.params;
  const { toEmail, leadId } = req.body;

  const step = await SequenceStep.findOne({
    where: { sequence_id: sequenceId, step_order: 1 }
  });

  const lead = await Lead.findByPk(leadId);

  if (!step || !lead) {
    return res.status(404).json({ message: 'Invalid data' });
  }

  const html = step.body.replace('{{name}}', lead.fullName);

  await sendCampaignEmail({
    to: toEmail,
    subject: `[TEST] ${step.subject}`,
    html
  });

  res.json({ message: 'Test email sent successfully' });
}

