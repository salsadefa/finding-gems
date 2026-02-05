"use strict";
// ============================================
// Report Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All report routes require authentication
router.use(auth_1.authenticate);
// Create a new report
router.post('/', report_controller_1.createReport);
// Get my reports
router.get('/my-reports', report_controller_1.getMyReports);
// Get specific report
router.get('/:id', report_controller_1.getReportById);
exports.default = router;
//# sourceMappingURL=report.routes.js.map