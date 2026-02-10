import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  listThreads,
  createThread,
  listThreadMessages,
  sendMessage,
  markThreadRead,
} from '../controllers/message.controller';

const router = Router();

router.use(authenticate);

router.get('/threads', listThreads);
router.post('/threads', createThread);
router.get('/threads/:id/messages', listThreadMessages);
router.post('/threads/:id/messages', sendMessage);
router.post('/threads/:id/read', markThreadRead);

export default router;
