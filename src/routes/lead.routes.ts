import { Router } from "express";
import { createLead, deleteLead, getAllLeads } from "../controllers/lead.controller.js";
import { auth } from "../middleware/auth.js";
import { paidGuard } from "../middleware/paidGuard.js";
import { creditGuard } from "../middleware/creditGuard.js";
import { bulkScrape } from "../controllers/scrape.controller.js";
import { enrichLead } from "../controllers/enrich.controller.js";
import { scoreICP } from "../controllers/icpProfile.controller.js";
import { generateLeads } from "../controllers/autoLead.controller.js";
import { startCampaign } from "../controllers/outbound.controller.js";
import { scrapeLinkedin } from "../controllers/linkedinScrape.controller.js";
import { getLeadStats } from "../controllers/leadStats.controller.js";
import { updateLead, getLead } from "../controllers/lead.controller.js";

const router = Router();

// Manual get/edit a lead
router.get("/lead/:id", auth, paidGuard, getLead);

// Manual update a lead
router.put("/lead/:id", auth, paidGuard, updateLead);

router.post(
  "/lead",
  auth, // 🔥 MUST BE HERE
  paidGuard,
  creditGuard({ cost: 1, reason: "lead_create" }),
  createLead
);

router.get("/leads", auth, paidGuard, getAllLeads);

router.post("/scrape", auth, paidGuard, bulkScrape);
router.post("/enrich", auth, paidGuard, enrichLead);
router.post("/icp-score", auth, paidGuard, scoreICP);
router.post("/auto-leads", auth, paidGuard, generateLeads);

router.post("/campaign", auth, paidGuard, startCampaign);

router.get("/leads/stats", auth, getLeadStats);

// router.post(
//   '/scrape/linkedin',
//   auth,
//   paidGuard,
//   scrapeLinkedInICP
// );

// router.post(
//   '/import/sales-nav',
//   auth,
//   paidGuard,
//   // upload.single('file'),
//   // importSalesNavigatorCSV
// );

router.post("/linkedin", auth, paidGuard, creditGuard, scrapeLinkedin);

router.delete("/lead/:id", auth, deleteLead);

export default router;
