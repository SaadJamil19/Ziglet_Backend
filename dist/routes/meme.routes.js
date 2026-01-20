"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meme_controller_1 = require("../controllers/meme.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const memeController = new meme_controller_1.MemeController();
// User Routes
router.post('/', auth_middleware_1.authenticateToken, memeController.submit);
// Admin Routes (Protected by Header Key in Controller for now, or split routers)
router.get('/pending', memeController.listPending);
router.post('/:id/review', memeController.review);
exports.default = router;
