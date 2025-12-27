export function calculateLeadQuality({
  icpScore,
  buyingIntentScore,
  confidenceScore,
  emailVerified,
}: {
  icpScore: number;
  buyingIntentScore: number;
  confidenceScore: number;
  emailVerified: boolean;
}) {
  const score =
    icpScore * 0.35 +
    buyingIntentScore * 0.3 +
    confidenceScore * 0.25 +
    (emailVerified ? 10 : 0);

  return Math.round(Math.min(100, Math.max(0, score)));
}
