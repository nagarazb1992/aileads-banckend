const ROLE_WEIGHTS: Record<string, number> = {
  ceo: 100,
  founder: 95,
  cto: 90,
  'vp': 85,
  'director': 80,
  'manager': 70,
  'lead': 65,
  'head': 60,
  'owner': 90,
  'president': 90,
  'chief': 90,
  'partner': 80,
  'principal': 75,
  'consultant': 60,
  'analyst': 55,
  'intern': 30,
  // Add more as needed
};
export function calculateICPScore(title: string): number {
  const lower = title.toLowerCase();

  for (const role in ROLE_WEIGHTS) {
    if (lower.includes(role)) {
      return ROLE_WEIGHTS[role];
    }
  }

  return 50; // default mid-fit
}
