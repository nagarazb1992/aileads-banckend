import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { paidGuard } from '../middleware/paidGuard.js';
import { createSequence, deleteSequence, getSequenceById, getSequences, previewEmail, testSendEmail, updateSequence } from '../controllers/sequence.controller.js';

const router = Router();

router.post('/', auth, paidGuard, createSequence);
router.get('/', auth, paidGuard, getSequences);
router.get('/:id', auth, paidGuard, getSequenceById);
router.delete('/:id', auth, paidGuard, deleteSequence);
router.put('/:id', auth, paidGuard, updateSequence);
router.post('/:sequenceId/preview', auth, paidGuard, previewEmail);
router.post('/:sequenceId/test-send', auth, paidGuard, testSendEmail);

// POST /api/sequences/:sequenceId/preview
// POST /api/sequences/:sequenceId/test-send

export default router;
