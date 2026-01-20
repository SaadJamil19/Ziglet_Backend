"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typeorm_1 = require("typeorm");
const SocialAccount_1 = require("./SocialAccount");
const TaskCompletion_1 = require("./TaskCompletion");
const FaucetClaim_1 = require("./FaucetClaim");
const PointsLedger_1 = require("./PointsLedger");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "zig_address", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "last_login_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SocialAccount_1.SocialAccount, (account) => account.user),
    __metadata("design:type", Array)
], User.prototype, "social_accounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TaskCompletion_1.TaskCompletion, (completion) => completion.user),
    __metadata("design:type", Array)
], User.prototype, "task_completions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FaucetClaim_1.FaucetClaim, (claim) => claim.user),
    __metadata("design:type", Array)
], User.prototype, "faucet_claims", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PointsLedger_1.PointsLedger, (ledger) => ledger.user),
    __metadata("design:type", Array)
], User.prototype, "points_ledger", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
