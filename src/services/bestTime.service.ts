
import SendTimeStat from "../models/SendTimeStat.js";


function defaultSendHour(channel: 'EMAIL' | 'WHATSAPP') {
  if (channel === 'EMAIL') return 10;     // 10 AM
  if (channel === 'WHATSAPP') return 11;  // 11 AM
}


export async function getBestSendTime(
  orgId: string,
  channel: 'EMAIL' | 'WHATSAPP'
): Promise<number> {
  const stats = await SendTimeStat.findAll({
    where: { org_id: orgId, channel },
  });

  if (!stats.length) return defaultSendHour(channel);

  const best = stats
    .map(s => ({
      hour: s.hour,
      rate: s.replies / Math.max(1, s.sends),
    }))
    .sort((a, b) => b.rate - a.rate)[0];

  if (best && typeof best.hour === 'number') {
    return best.hour;
  } else {
    return defaultSendHour(channel);
  }
}
