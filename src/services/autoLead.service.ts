import { Lead } from "../models/lead.model.js";
import { consumeCredits } from "./credit.service.js";
import { findCompaniesFromICP } from "./icpCompany.service.js";
import { batchDecisionMakers } from "../decision-makers/decisionMaker.batch.js";
import { learnEmailPattern } from "../enrichment/emailPatternLearner.js";

const COST_PER_LEAD = 3;

export async function runAutoLeadGeneration({
  orgId,
  icpDescription,
  jobRoles,
  industries,
  countries,
  company_size_min,
  company_size_max,
  jobLimit,
}: {
  orgId: string;
  icpDescription: string;
  jobRoles: string[];
  industries: string[];
  countries: string[];
  company_size_min: number;
  company_size_max: number;
  jobLimit: number;
}) {

  /**
   * STEP 1: Find ICP-matched companies
   */
  const companies = await findCompaniesFromICP(
    icpDescription,
    jobRoles,
    industries,
    countries,
    company_size_min,
    company_size_max,
    jobLimit
  );

  console.log(`🏢 Matched companies: ${companies.length}`);
  if (!companies.length) return;

  console.log('Companies:', companies);

  /**
   * STEP 2: BULK decision-maker discovery (parallel + rate-safe)
   */
  const companyDecisionMakers = await batchDecisionMakers(
    companies,
    3 // decision makers per company
  );

  console.log(`👥 Discovered decision makers for companies.`, companyDecisionMakers);

  /**
   * STEP 3: Iterate companies + people
   */
  for (const { company, decisionMakers } of companyDecisionMakers) {
    if (!decisionMakers?.length) continue;

    console.log(`Processing company: ${company.name} with ${decisionMakers.length} decision makers`);

    console.log('Decision Makers:', company);

    for (const person of decisionMakers) {

      /**
       * STEP 4: De-duplication
       */
      const exists = await Lead.findOne({
        where: {
          org_id: orgId,
          email: person.email,
        },
      });

      console.log(`Checking existing lead for email: ${person.email} - Exists: ${!!exists}`);

      if (exists) continue;

      console.log(`Processing lead for: ${person.name} at ${company.name}`);

      /**
       * STEP 5: Final confidence score
       * Company fit > Person guess
       */
      const finalScore = Math.round(
        (person.confidence ?? 0) * 0.4
      );

      console.log(`Final lead score for ${person.email}: ${finalScore}`);

      /**
       * STEP 6: Create Lead
       */
      const lead = await Lead.create({
        org_id: orgId,
        organization_id: orgId,

        fullName: person.name,
        email: person.email,
        emailStatus: "UNKNOWN",

        linkedinUrl: person.linkedinUrl || company.linkedin_url || null,
        jobTitle: person.title || null,

        companyName: company.name,
        companyDomain: company.domain || null,

        score: finalScore,
        scoreReason: "ai_confidence_model",

        priority:
          finalScore >= 80 ? "HOT" :
          finalScore >= 60 ? "WARM" :
          "COLD",

        status: "NEW",
        enriched: true,

        /**
         * STEP 7: Explainability (critical for trust & audits)
         */
        meta: {
          company_confidence: company.confidence_score,
          person_confidence: person.confidence,
          confidence_breakdown: company.confidence_breakdown,
          estimated_company_size: company.estimated_size,
          domain_verified: company.verified_domain,
          role: person.title,
          source_company: company.name,
        },

        source: "ai_auto",
      });

      

      console.log(`✅ Lead created: ${lead.email}`);

      /**
       * STEP 8: Learn email pattern from SUCCESS
       */
      if (company.domain && person.email) {
        learnEmailPattern(company.domain, person.email);
      }

      /**
       * STEP 9: Charge credits ONLY after success
       */
      await consumeCredits({
        orgId,
        amount: COST_PER_LEAD,
        reason: "auto_lead_generation",
        referenceId: lead.getDataValue("id"),
      });
    }
  }
}
