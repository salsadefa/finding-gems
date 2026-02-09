// ============================================
// Weekly Drops Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import { getDropBySlug, getLatestDrop } from '../controllers/drop.controller';

const router = Router();

router.get('/latest', getLatestDrop);
router.get('/:slug', getDropBySlug);

export default router;
