"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
const adminController = new admin_controller_1.AdminController();
router.post('/faucet/process', adminController.processFaucet);
exports.default = router;
