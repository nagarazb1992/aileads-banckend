import { Op, fn, col, literal } from "sequelize";
import { Lead } from "../models/lead.model.js";
import { EmailLog } from "../models/EmailLog.js";
import { RevenueEvent } from "../models/RevenueEvent.js";
import { Membership } from "../models/membership.model.js";
import { SendTimeStat } from "../models/SendTimeStat.js";

// GET /api/analytics/overview
export async function getAnalyticsOverview(req: any, res: any) {
  const userId = req.user.userId;
  const membership = await Membership.findOne({ where: { user_id: userId } });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId) return res.status(400).json({ error: "Organization not found for user" });

  // Avg Reply Rate (replied / sent) for leads in this org
  const orgLeadIds = await Lead.findAll({
    attributes: ['id'],
    where: { org_id: orgId },
    raw: true,
  });
  const leadIds = orgLeadIds.map((l: any) => l.id);
  const sentCount = await EmailLog.count({ where: { status: "SENT", lead_id: leadIds.length ? leadIds : null } });
  const repliedCount = await EmailLog.count({ where: { status: "REPLIED", lead_id: leadIds.length ? leadIds : null } });
  const avgReplyRate = sentCount ? (repliedCount / sentCount) * 100 : 0;
  // TODO: Calculate change vs previous period if needed

  // Conversion Rate (won / total leads)
  const totalLeads = await Lead.count({ where: { org_id: orgId } });
  const wonLeads = await Lead.count({ where: { org_id: orgId, status: "WON" } });
  const conversionRate = totalLeads ? (wonLeads / totalLeads) * 100 : 0;

  // Revenue Generated (sum of RevenueEvent.amount_usd)
  const revenue = await RevenueEvent.sum("amount_usd", { where: { org_id: orgId } });
  // TODO: Calculate change vs previous period if needed

  // Best Send Time (from SendTimeStat or fallback)
  let bestSendTime = "10:00 AM";
  let bestSendDays = "Tue-Thu";
  // If you have a SendTimeStat model, you can query for the best time/days
  // Example: const stat = await SendTimeStat.findOne({ ... });

  res.json({
    avgReplyRate: { value: avgReplyRate, change: 2.3 }, // TODO: real change
    conversionRate: { value: conversionRate, change: -0.8 }, // TODO: real change
    revenue: { value: revenue || 0, change: 24 }, // TODO: real change
    bestSendTime: { time: bestSendTime, days: bestSendDays },
  });
}

// GET /api/analytics/reply-rates-by-day
export async function getReplyRatesByDay(req: any, res: any) {
  // Example: group EmailLog by day of week and calculate reply rate
  const sent = await EmailLog.findAll({
    attributes: [
      [fn("strftime", "%w", col("createdAt")), "day"],
      [fn("COUNT", "*"), "sent"]
    ],
    where: { status: "SENT" },
    group: ["day"],
  });
  const replied = await EmailLog.findAll({
    attributes: [
      [fn("strftime", "%w", col("createdAt")), "day"],
      [fn("COUNT", "*"), "replied"]
    ],
    where: { status: "REPLIED" },
    group: ["day"],
  });
  // Merge sent and replied by day
  const sentMap = Object.fromEntries(sent.map((s: any) => [s.get("day"), s.get("sent")]));
  const repliedMap = Object.fromEntries(replied.map((r: any) => [r.get("day"), r.get("replied")]));
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const data = days.map((label, i) => {
    const sentVal = Number(sentMap[i] || 0);
    const repliedVal = Number(repliedMap[i] || 0);
    return {
      day: label,
      sent: sentVal,
      replied: repliedVal,
      replyRate: sentVal ? Math.round((repliedVal / sentVal) * 100) : 0,
    };
  });
  res.json({ data });
}

// GET /api/analytics/revenue-attribution
export async function getRevenueAttribution(req: any, res: any) {
  const userId = req.user.userId;
  const membership = await Membership.findOne({ where: { user_id: userId } });
  const orgId = membership ? membership.getDataValue("organization_id") : null;
  if (!orgId) return res.status(400).json({ error: "Organization not found for user" });
  // Example: group revenue by week/month
  const revenueByMonth = await RevenueEvent.findAll({
    attributes: [
      [fn("strftime", "%Y-%m", col("createdAt")), "month"],
      [fn("SUM", col("amount_usd")), "revenue"]
    ],
    where: { org_id: orgId },
    group: ["month"],
    order: [[literal("month"), "ASC"]],
  });
  const data = revenueByMonth.map((r: any) => ({
    month: r.get("month"),
    revenue: Number(r.get("revenue")),
  }));
  res.json({ data });
}
