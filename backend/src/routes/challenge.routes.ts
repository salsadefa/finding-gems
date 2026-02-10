import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { listChallenges, getChallengeBySlug } from '../controllers/challenge.controller';
import { createChallengeSubmission, updateChallengeSubmission, getMyChallengeSubmission } from '../controllers/challenge-creator.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const isDevelopment = process.env.NODE_ENV !== 'production';

const submissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: isDevelopment ? 20 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = (req as any).user?.id;
    return userId ? `user:${userId}` : `ip:${req.ip}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many submissions. Please wait a bit and try again.',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

// Public
router.get('/', listChallenges);
router.get('/:slug', getChallengeBySlug);

// Creator
router.post('/:slug/submissions', authenticate, authorize('creator'), submissionLimiter, createChallengeSubmission);
router.get('/:slug/my-submission', authenticate, authorize('creator'), getMyChallengeSubmission);
router.patch('/submissions/:id', authenticate, authorize('creator'), updateChallengeSubmission);

export default router;
