"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const creator_application_controller_1 = require("../controllers/creator-application.controller");
const router = (0, express_1.Router)();
// User routes (authenticated)
router.get('/me', auth_1.authenticate, creator_application_controller_1.getMyApplication);
router.post('/', auth_1.authenticate, creator_application_controller_1.createApplication);
// Admin routes
router.get('/', auth_1.authenticate, creator_application_controller_1.getApplications);
router.post('/:id/approve', auth_1.authenticate, creator_application_controller_1.approveApplication);
router.post('/:id/reject', auth_1.authenticate, creator_application_controller_1.rejectApplication);
exports.default = router;
//# sourceMappingURL=creator-application.routes.js.map