export function rescoreConfidence({
  baseConfidence,
  replied,
  sentiment,
}: {
  baseConfidence: number;
  replied: boolean;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}) {
  let score = baseConfidence;

  if (replied) score += 10;
  if (sentiment === 'POSITIVE') score += 15;
  if (sentiment === 'NEGATIVE') score -= 10;

  return Math.max(0, Math.min(100, score));
}
