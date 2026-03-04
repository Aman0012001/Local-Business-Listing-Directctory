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
exports.ReviewHelpfulVote = void 0;
const typeorm_1 = require("typeorm");
const review_entity_1 = require("./review.entity");
const user_entity_1 = require("./user.entity");
let ReviewHelpfulVote = class ReviewHelpfulVote {
};
exports.ReviewHelpfulVote = ReviewHelpfulVote;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'review_id', type: 'uuid' }),
    __metadata("design:type", String)
], ReviewHelpfulVote.prototype, "reviewId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'uuid' }),
    __metadata("design:type", String)
], ReviewHelpfulVote.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReviewHelpfulVote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => review_entity_1.Review, (review) => review.helpfulVotes),
    (0, typeorm_1.JoinColumn)({ name: 'review_id' }),
    __metadata("design:type", review_entity_1.Review)
], ReviewHelpfulVote.prototype, "review", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ReviewHelpfulVote.prototype, "user", void 0);
exports.ReviewHelpfulVote = ReviewHelpfulVote = __decorate([
    (0, typeorm_1.Entity)('review_helpful_votes')
], ReviewHelpfulVote);
//# sourceMappingURL=review-helpful-vote.entity.js.map