export function calculateLinkedInActivityScore(profile: {
  lastPostDays?: number;
  jobChange?: boolean;
  active?: boolean;
}) {
  let score = 0;

  if (profile.lastPostDays && profile.lastPostDays <= 30) score += 10;
  if (profile.jobChange) score += 15;
  if (profile.active) score += 10;

  return Math.min(30, score);
}
