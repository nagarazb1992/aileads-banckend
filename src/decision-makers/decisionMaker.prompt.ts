export function buildDecisionMakerPrompt(
  company: {
    name: string;
    domain: string;
    industry?: string;
    employeeCount?: number;
  },
  limit: number
) {
  return `
You are a B2B sales intelligence assistant.

Company:
- Name: ${company.name}
- Domain: ${company.domain}
- Industry: ${company.industry || 'Unknown'}
- Employees: ${company.employeeCount || 'Unknown'}

Generate up to ${limit} senior decision makers.

Rules:
- Titles: CTO, CIO, VP Engineering, Head of Engineering, Director of Engineering
- Emails must use company domain
- Avoid generic inboxes
- LinkedIn URLs must be realistic
- Confidence 60–95

Return ONLY JSON.
`;
}
