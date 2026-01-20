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
exports.MemeSubmission = exports.SubmissionStatus = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Task_1 = require("./Task");
var SubmissionStatus;
(function (SubmissionStatus) {
    SubmissionStatus["PENDING"] = "pending";
    SubmissionStatus["APPROVED"] = "approved";
    SubmissionStatus["REJECTED"] = "rejected";
})(SubmissionStatus || (exports.SubmissionStatus = SubmissionStatus = {}));
let MemeSubmission = class MemeSubmission {
};
exports.MemeSubmission = MemeSubmission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MemeSubmission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", User_1.User)
], MemeSubmission.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Task_1.Task),
    (0, typeorm_1.JoinColumn)({ name: 'task_id' }),
    __metadata("design:type", Task_1.Task)
], MemeSubmission.prototype, "task", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MemeSubmission.prototype, "image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubmissionStatus, default: SubmissionStatus.PENDING }),
    __metadata("design:type", String)
], MemeSubmission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MemeSubmission.prototype, "admin_feedback", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MemeSubmission.prototype, "submitted_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MemeSubmission.prototype, "reviewed_at", void 0);
exports.MemeSubmission = MemeSubmission = __decorate([
    (0, typeorm_1.Entity)('meme_submissions')
], MemeSubmission);
