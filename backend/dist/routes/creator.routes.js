"use strict";
// ============================================
// Creator Routes - Finding Gems Backend
// ============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const creator_controller_1 = require("../controllers/creator.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', auth_1.optionalAuth, creator_controller_1.getCreators);
// Protected routes (must come before /:idOrUsername)
router.get('/me', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), creator_controller_1.getMyCreatorProfile);
router.patch('/me', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), creator_controller_1.updateMyCreatorProfile);
router.get('/me/stats', auth_1.authenticate, (0, auth_1.authorize)('creator', 'admin'), creator_controller_1.getCreatorStats);
// Public route with dynamic param (must come last)
router.get('/:idOrUsername', auth_1.optionalAuth, creator_controller_1.getCreatorProfile);
exports.default = router;
//# sourceMappingURL=creator.routes.js.map