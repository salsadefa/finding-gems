// ============================================
// Report Routes - Finding Gems Backend
// ============================================

import { Router } from 'express';
import {
  createReport,
  getMyReports,
  getReportById,
} from '../controllers/report.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(authenticate);

// Create a new report
router.post('/', createReport);

// Get my reports
router.get('/my-reports', getMyReports);

// Get specific report
router.get('/:id', getReportById);

export default router;
