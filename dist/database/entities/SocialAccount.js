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
exports.SocialAccount = exports.SocialPlatform = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
var SocialPlatform;
(function (SocialPlatform) {
    SocialPlatform["TWITTER"] = "twitter";
    SocialPlatform["TELEGRAM"] = "telegram";
    SocialPlatform["INSTAGRAM"] = "instagram";
})(SocialPlatform || (exports.SocialPlatform = SocialPlatform = {}));
let SocialAccount = class SocialAccount {
};
exports.SocialAccount = SocialAccount;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SocialAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.social_accounts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], SocialAccount.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SocialPlatform }),
    __metadata("design:type", String)
], SocialAccount.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SocialAccount.prototype, "platform_user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SocialAccount.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SocialAccount.prototype, "verified_at", void 0);
exports.SocialAccount = SocialAccount = __decorate([
    (0, typeorm_1.Entity)('social_accounts'),
    (0, typeorm_1.Unique)(['platform', 'platform_user_id']),
    (0, typeorm_1.Unique)(['user', 'platform'])
], SocialAccount);
