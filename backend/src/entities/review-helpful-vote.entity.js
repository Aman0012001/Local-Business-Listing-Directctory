"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewHelpfulVote = void 0;
var typeorm_1 = require("typeorm");
var review_entity_1 = require("./review.entity");
var user_entity_1 = require("./user.entity");
var ReviewHelpfulVote = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('review_helpful_votes')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _reviewId_decorators;
    var _reviewId_initializers = [];
    var _reviewId_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _review_decorators;
    var _review_initializers = [];
    var _review_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var ReviewHelpfulVote = _classThis = /** @class */ (function () {
        function ReviewHelpfulVote_1() {
            this.reviewId = __runInitializers(this, _reviewId_initializers, void 0);
            this.userId = (__runInitializers(this, _reviewId_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.createdAt = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            // Relations
            this.review = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _review_initializers, void 0));
            this.user = (__runInitializers(this, _review_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            __runInitializers(this, _user_extraInitializers);
        }
        return ReviewHelpfulVote_1;
    }());
    __setFunctionName(_classThis, "ReviewHelpfulVote");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _reviewId_decorators = [(0, typeorm_1.PrimaryColumn)({ name: 'review_id', type: 'uuid' })];
        _userId_decorators = [(0, typeorm_1.PrimaryColumn)({ name: 'user_id', type: 'uuid' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _review_decorators = [(0, typeorm_1.ManyToOne)(function () { return review_entity_1.Review; }, function (review) { return review.helpfulVotes; }), (0, typeorm_1.JoinColumn)({ name: 'review_id' })];
        _user_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)({ name: 'user_id' })];
        __esDecorate(null, null, _reviewId_decorators, { kind: "field", name: "reviewId", static: false, private: false, access: { has: function (obj) { return "reviewId" in obj; }, get: function (obj) { return obj.reviewId; }, set: function (obj, value) { obj.reviewId = value; } }, metadata: _metadata }, _reviewId_initializers, _reviewId_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _review_decorators, { kind: "field", name: "review", static: false, private: false, access: { has: function (obj) { return "review" in obj; }, get: function (obj) { return obj.review; }, set: function (obj, value) { obj.review = value; } }, metadata: _metadata }, _review_initializers, _review_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ReviewHelpfulVote = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ReviewHelpfulVote = _classThis;
}();
exports.ReviewHelpfulVote = ReviewHelpfulVote;
