import { Router } from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { paidGuard } from '../middleware/paidGuard.js';
import {
  uploadCsv,
  previewCsv,
  importCsv
} from '../controllers/csvImport.controller.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth, paidGuard, upload.single('file'), uploadCsv);
router.get('/preview/:jobId', auth, previewCsv);
router.post('/import/:jobId', auth, paidGuard, importCsv);

export default router;
