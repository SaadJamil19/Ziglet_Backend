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
exports.FaucetClaim = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const TaskCompletion_1 = require("./TaskCompletion");
let FaucetClaim = class FaucetClaim {
};
exports.FaucetClaim = FaucetClaim;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FaucetClaim.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.faucet_claims),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], FaucetClaim.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TaskCompletion_1.TaskCompletion),
    (0, typeorm_1.JoinColumn)({ name: 'task_completion_id' }),
    __metadata("design:type", TaskCompletion_1.TaskCompletion)
], FaucetClaim.prototype, "task_completion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FaucetClaim.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], FaucetClaim.prototype, "tx_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'confirmed' }),
    __metadata("design:type", String)
], FaucetClaim.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FaucetClaim.prototype, "claimed_at", void 0);
exports.FaucetClaim = FaucetClaim = __decorate([
    (0, typeorm_1.Entity)('faucet_claims')
], FaucetClaim);
