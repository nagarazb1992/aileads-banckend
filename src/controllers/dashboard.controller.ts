const { default: sequelize } = await import("../config/database.js");
import { Op } from "sequelize";
import { Lead } from "../models/lead.model.js";
import { Membership } from "../models/membership.model.js";
import { Meeting } from "../models/Meeting.js";
import { EmailLog } from "../models/EmailLog.js";

// Main dashboard stats (lead stats, pipeline, rates, sources)
export async function getDashboard(req: any, res: any) {
  const userId = req.user.userId; 

  const membership = await Membership.findOne({ where: { user_id: userId } });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId) {
    return res.status(400).json({ error: "Organization not found for user" });
  }
  const totalLeads = await Lead.count({ where: { org_id: orgId } });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  // Leads created this month
  const newThisMonth = await Lead.count({
    where: { org_id: orgId, createdAt: { [Op.gte]: startOfMonth } },
  });

  // Leads created last month
  const newLastMonth = await Lead.count({
    where: {
      org_id: orgId,
      createdAt: {
        [Op.gte]: startOfLastMonth,
        [Op.lt]: startOfMonth,
      },
    },
  });

  // Total leads at end of last month
  const totalLeadsLastMonth = await Lead.count({
    where: {
      org_id: orgId,
      createdAt: { [Op.lte]: endOfLastMonth },
    },
  });

  // Import sequelize instance

  // Pipeline counts by status
  const pipelineStatuses = ["NEW", "CONTACTED", "QUALIFIED", "MEETING", "WON"];
  const pipelineCountsRaw = await Lead.findAll({
    attributes: ["status", [sequelize.fn("COUNT", "*"), "count"]],
    where: { org_id: orgId },
    group: ["status"],
  });
  const pipeline = Object.fromEntries(pipelineStatuses.map(s => [s.toLowerCase(), 0]));
  for (const item of pipelineCountsRaw) {
    const status = item.getDataValue("status");
    const count = parseInt(item.getDataValue("count"), 10);
    if (status && pipeline[status.toLowerCase()] !== undefined) {
      pipeline[status.toLowerCase()] = count;
    }
  }

  // Rates (example calculations, adjust as needed)
  const contactRate = pipeline.contacted && pipeline.new ? Math.round((pipeline.contacted / pipeline.new) * 100) : 0;
  const qualifyRate = pipeline.qualified && pipeline.contacted ? Math.round((pipeline.qualified / pipeline.contacted) * 100) : 0;
  const meetingRate = pipeline.meeting && pipeline.qualified ? Math.round((pipeline.meeting / pipeline.qualified) * 100) : 0;
  const winRate = pipeline.won && pipeline.qualified ? Math.round((pipeline.won / pipeline.qualified) * 100) : 0;

  // By source
  const bySource = await Lead.findAll({
    attributes: ["source", [sequelize.fn("COUNT", "*"), "count"]],
    where: { org_id: orgId },
    group: ["source"],
  });
  const totalSource = bySource.reduce((sum, item) => sum + parseInt(item.getDataValue("count"), 10), 0);
  const sources = bySource.map((item: any) => ({
    label: item.getDataValue("source"),
    value: parseInt(item.getDataValue("count"), 10),
    percent: totalSource ? Math.round((parseInt(item.getDataValue("count"), 10) / totalSource) * 100) : 0,
  }));

  // Calculate changePercent utility
  function calcChange(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  // Meetings booked (real data)
  const meetingsBooked = await Meeting.count({ where: { orgId } });
  // Conversion rate: won/total
  const conversionRate = totalLeads ? Math.round((pipeline.won / totalLeads) * 100) : 0;

  res.json({
    summary: {
      totalLeads: {
        value: totalLeads,
        changePercent: calcChange(totalLeads, totalLeadsLastMonth),
      },
      newLeadsThisMonth: {
        value: newThisMonth,
        changePercent: calcChange(newThisMonth, newLastMonth),
      },
      meetingsBooked: { value: meetingsBooked, changePercent: 0 },
      conversionRate: { value: conversionRate, changePercent: 0 },
    },
    pipeline,
    rates: {
      contactRate,
      qualifyRate,
      meetingRate,
      winRate,
    },
    sources,
  });
}

// Leads by source (for donut chart)
export async function getLeadsBySource(req: any, res: any) {
  const userId = req.user.userId;
  const membership = await Membership.findOne({ where: { user_id: userId } });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId) return res.status(400).json({ error: "Organization not found for user" });
  const bySource = await Lead.findAll({
    attributes: ["source", [sequelize.fn("COUNT", "*"), "count"]],
    where: { org_id: orgId },
    group: ["source"],
  });
  const total = bySource.reduce((sum, item) => sum + parseInt(item.getDataValue("count"), 10), 0);
  const sources = bySource.map((item: any) => ({
    label: item.getDataValue("source"),
    value: parseInt(item.getDataValue("count"), 10),
    percent: total ? Math.round((parseInt(item.getDataValue("count"), 10) / total) * 100) : 0,
  }));
  res.json({ sources });
}

// Upcoming meetings
export async function getUpcomingMeetings(req: any, res: any) {
  const userId = req.user.userId;
  const membership = await Membership.findOne({ where: { user_id: userId } });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId) return res.status(400).json({ error: "Organization not found for user" });
  const now = new Date();
  const meetings = await Meeting.findAll({
    where: { orgId, startTime: { [Op.gte]: now } },
    order: [["startTime", "ASC"]],
    limit: 5,
  });
  res.json({ meetings });
}

// Recent activity (last 10 email logs)
export async function getRecentActivity(req: any, res: any) {
  const userId = req.user.userId;
  const membership = await Membership.findOne({ where: { user_id: userId } });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId) return res.status(400).json({ error: "Organization not found for user" });
  const activities = await EmailLog.findAll({
    where: {}, // Optionally filter by orgId if available in EmailLog
    order: [["createdAt", "DESC"]],
    limit: 10,
  });

  // Get unique lead_ids from activities
  const leadIds = [...new Set(activities.map((a: any) => a.lead_id).filter(Boolean))];
  // Fetch all leads in one query
  const leads = await Lead.findAll({ where: { id: leadIds } });
  const leadMap = Object.fromEntries(leads.map((l: any) => [l.id, l]));

  // Map activities to include lead details and a readable activity description
  const activityDetails = activities.map((a: any) => {
    const lead = leadMap[a.lead_id] || null;
    let activityType = a.status;
    let description = '';
    switch (a.status) {
      case 'SENT':
        description = `Email sent to ${lead ? lead.fullName : 'Unknown'} (${lead ? lead.email : ''})`;
        break;
      case 'OPENED':
        description = `Email opened by ${lead ? lead.fullName : 'Unknown'} (${lead ? lead.email : ''})`;
        break;
      case 'REPLIED':
        description = `Reply received from ${lead ? lead.fullName : 'Unknown'} (${lead ? lead.email : ''})`;
        break;
      case 'FAILED':
        description = `Failed to send email to ${lead ? lead.fullName : 'Unknown'} (${lead ? lead.email : ''})`;
        break;
      default:
        description = `Activity: ${a.status} for ${lead ? lead.fullName : 'Unknown'} (${lead ? lead.email : ''})`;
    }
    return {
      id: a.id,
      type: activityType,
      description,
      createdAt: a.createdAt,
      lead: lead ? {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        jobTitle: lead.jobTitle,
        companyName: lead.companyName,
      } : null,
    };
  });

  res.json({ activities: activityDetails });
}

