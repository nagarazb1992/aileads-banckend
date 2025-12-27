import { findDecisionMakers } from "./findDecisionMakers.js";

export async function batchDecisionMakers(
  companies: any[],
  limitPerCompany = 3
) {
  const results = await Promise.all(
    companies.map(company =>
      findDecisionMakers(company, limitPerCompany)
    )
  );

  console.log(`Batch decision makers results:`, results);

  return companies.map((company, index) => ({
    company,
    decisionMakers: results[index],
  }));
}
