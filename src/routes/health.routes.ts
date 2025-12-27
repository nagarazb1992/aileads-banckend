import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;
