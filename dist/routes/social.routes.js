"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_controller_1 = require("../controllers/social.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const socialController = new social_controller_1.SocialController();
// Protected Routes
router.get('/twitter/connect', auth_middleware_1.authenticateToken, socialController.initiateTwitterAuth);
router.post('/twitter/callback', auth_middleware_1.authenticateToken, socialController.linkTwitter);
exports.default = router;
