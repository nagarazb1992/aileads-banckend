export function estimateCompanySize(industry: string): number {
  const map: Record<string, number> = {
    SaaS: 200,
    Fintech: 500,
    Ecommerce: 300,
    Healthcare: 1000,
    Manufacturing: 1500
  };

  return map[industry] ?? 250;
}
