export function explainLeadQuality({
  icpScore,
  buyingIntent,
  confidence,
  emailVerified,
}: any) {
  return {
    icp: {
      score: icpScore,
      reason: 'Job title matches target persona',
    },
    buyingIntent: {
      score: buyingIntent,
      reason: buyingIntent > 70
        ? 'Company shows active buying signals'
        : 'Limited recent buying activity',
    },
    confidence: {
      score: confidence,
      reason: 'Decision-maker role detected',
    },
    email: {
      verified: emailVerified,
      reason: emailVerified
        ? 'Email verified successfully'
        : 'Email not verified',
    },
  };
}
