import { Router } from 'express';


import {
  createTemplate,
  listTemplates,
  getTemplateById,
  updateTemplate,
  archiveTemplate,
  generateAdvancedEmailBody
} from '../controllers/emailTemplate.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Generate advanced email body via AI
router.post('/generate-ai', auth, generateAdvancedEmailBody);

// List templates
router.get('/', auth, listTemplates);

// Get single template
router.get('/:id', auth, getTemplateById);

// Create template (manual)
router.post('/', auth, createTemplate);

// Update template
router.put('/:id', auth, updateTemplate);

// Archive template (soft delete)
router.delete('/:id', auth, archiveTemplate);

export default router;
