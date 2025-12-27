import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { paidGuard } from '../middleware/paidGuard.js';
import { createCampaign, deleteCampaign, getCampaignById, getCampaigns, pauseCampaign, resumeCampaign, startCampaignWithLeads, updateCampaign } from '../controllers/campaign.controller.js';
import { attachLeadsToCampaign, deattachLeadsFromCampaign, getAllCampaignLeads } from '../controllers/attachLeadsToCampaign.js';
import { connectEmailToCampaign } from '../controllers/campaignEmail.controller.js';

const router = Router();

router.post('/', auth, paidGuard, createCampaign);
// router.get('/', auth, paidGuard, getAllCampaign);
router.get('/', auth, paidGuard, getCampaigns);
router.put('/:id', auth, paidGuard, updateCampaign);
router.delete('/:id', auth, paidGuard, deleteCampaign);
router.get('/:campaignId', auth, paidGuard, getCampaignById);
router.post('/:campaignId/leads', auth, paidGuard, attachLeadsToCampaign);
router.get('/:campaignId/leads', auth, paidGuard, getAllCampaignLeads);
router.delete('/:campaignId/leads', auth, paidGuard, deattachLeadsFromCampaign);
router.post(
  '/:campaignId/start',
  auth,
  paidGuard,
  startCampaignWithLeads
);
router.post('/:campaignId/pause', auth, paidGuard, pauseCampaign);
router.post('/:campaignId/resume', auth, paidGuard, resumeCampaign);

router.post(
  '/:campaignId/email',
  auth,
  paidGuard,
  connectEmailToCampaign
);
// POST /api/campaigns/:campaignId/pause
// POST /api/campaigns/:campaignId/resume

export default router;
