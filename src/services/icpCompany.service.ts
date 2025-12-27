import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

type CompanyResult = {
  name: string;
  domain: string;
  country: string;
  industry: string;
};

export async function findCompaniesFromICP(
  icpDescription: string,
  jobRoles: string[],
  industries: string[],
  countries: string[],
  company_size_min: number,
  company_size_max: number,
  jobLimit: number
): Promise<CompanyResult[]> {

  const prompt = `
You are a senior B2B market research analyst.

Your task is to identify REAL, CURRENTLY OPERATING companies
that match the given Ideal Customer Profile (ICP).

ICP Description:
${icpDescription}

Strict Filters (MUST FOLLOW):
- Industries: ${industries.length ? industries.join(', ') : 'Any'}
- Target countries: ${countries.length ? countries.join(', ') : 'Any'}
- Company size: ${company_size_min} to ${company_size_max} employees
- Relevant buyers / job roles: ${jobRoles.length ? jobRoles.join(', ') : 'Any'}

Rules (MANDATORY):
- Return ONLY real, well-known, operating companies
- Do NOT invent startups or obscure companies
- Use the OFFICIAL primary company website domain
- Company headquarters must match the country
- Industry must clearly align with ICP
- If unsure about a company, DO NOT include it
- Avoid subsidiaries unless they operate independently
- Do NOT include marketplaces, agencies, or consultancies unless ICP explicitly allows
- Do NOT return explanations, comments, or markdown

Output requirements:
- Return EXACTLY ${jobLimit} companies if possible
- Return ONLY a raw JSON array (no wrapping object)

JSON format:
[
  {
    "name": "Company legal or brand name",
    "domain": "official-domain.com",
    "country": "Country name",
    "industry": "Primary industry"
  }
]

Final self-check before responding:
- Every domain must be valid and public
- Every company must be realistically known in its market
- JSON must be parsable with JSON.parse()
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      { role: 'system', content: 'You only return valid JSON. No markdown. No text.' },
      { role: 'user', content: prompt }
    ],
  });

  let raw = res.choices?.[0]?.message?.content ?? '[]';

  // Defensive cleanup
  raw = raw
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();

  let companies: CompanyResult[] = [];

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      companies = parsed;
    } else if (parsed && Array.isArray(parsed.companies)) {
      companies = parsed.companies;
    }
  } catch (err) {
    console.error('❌ Failed to parse companies JSON:', err, raw);
    return [];
  }

  // Final sanity filtering (defensive)
  return companies
    .filter(c =>
      c?.name &&
      c?.domain &&
      c?.country &&
      c?.industry &&
      !c.domain.includes('example') &&
      !c.domain.includes('test')
    )
    .slice(0, jobLimit);
}
