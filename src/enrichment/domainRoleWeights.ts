export const ROLE_WEIGHTS: Record<string, number> = {
  CTO: 1.3,
  CIO: 1.25,
  'VP Engineering': 1.2,
  'Head of Engineering': 1.15,
  'Director of Engineering': 1.1,
};

export function applyRoleWeight(score: number, title: string): number {
  const weight = ROLE_WEIGHTS[title] || 1;
  return Math.min(100, Math.round(score * weight));
}
