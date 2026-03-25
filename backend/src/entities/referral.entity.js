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
exports.AffiliateReferral = exports.ReferralStatus = exports.ReferralType = void 0;
var typeorm_1 = require("typeorm");
var affiliate_entity_1 = require("./affiliate.entity");
var user_entity_1 = require("./user.entity");
var ReferralType;
(function (ReferralType) {
    ReferralType["SUBSCRIPTION"] = "subscription";
    ReferralType["SIGNUP"] = "signup";
})(ReferralType || (exports.ReferralType = ReferralType = {}));
var ReferralStatus;
(function (ReferralStatus) {
    ReferralStatus["PENDING"] = "pending";
    ReferralStatus["CONVERTED"] = "converted";
    ReferralStatus["EXPIRED"] = "expired";
})(ReferralStatus || (exports.ReferralStatus = ReferralStatus = {}));
var AffiliateReferral = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('affiliate_referrals')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _affiliateId_decorators;
    var _affiliateId_initializers = [];
    var _affiliateId_extraInitializers = [];
    var _referredUserId_decorators;
    var _referredUserId_initializers = [];
    var _referredUserId_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _commissionAmount_decorators;
    var _commissionAmount_initializers = [];
    var _commissionAmount_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _affiliate_decorators;
    var _affiliate_initializers = [];
    var _affiliate_extraInitializers = [];
    var _referredUser_decorators;
    var _referredUser_initializers = [];
    var _referredUser_extraInitializers = [];
    var AffiliateReferral = _classThis = /** @class */ (function () {
        function AffiliateReferral_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.affiliateId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _affiliateId_initializers, void 0));
            this.referredUserId = (__runInitializers(this, _affiliateId_extraInitializers), __runInitializers(this, _referredUserId_initializers, void 0));
            this.type = (__runInitializers(this, _referredUserId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.status = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.commissionAmount = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _commissionAmount_initializers, void 0));
            this.createdAt = (__runInitializers(this, _commissionAmount_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            // Relations
            this.affiliate = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _affiliate_initializers, void 0));
            this.referredUser = (__runInitializers(this, _affiliate_extraInitializers), __runInitializers(this, _referredUser_initializers, void 0));
            __runInitializers(this, _referredUser_extraInitializers);
        }
        return AffiliateReferral_1;
    }());
    __setFunctionName(_classThis, "AffiliateReferral");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _affiliateId_decorators = [(0, typeorm_1.Column)({ name: 'affiliate_id' }), (0, typeorm_1.Index)()];
        _referredUserId_decorators = [(0, typeorm_1.Column)({ name: 'referred_user_id' }), (0, typeorm_1.Index)()];
        _type_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: ReferralType,
            })];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: ReferralStatus,
                default: ReferralStatus.PENDING,
            })];
        _commissionAmount_decorators = [(0, typeorm_1.Column)({ name: 'commission_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _affiliate_decorators = [(0, typeorm_1.ManyToOne)(function () { return affiliate_entity_1.Affiliate; }, function (affiliate) { return affiliate.referrals; }), (0, typeorm_1.JoinColumn)({ name: 'affiliate_id' })];
        _referredUser_decorators = [(0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)({ name: 'referred_user_id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _affiliateId_decorators, { kind: "field", name: "affiliateId", static: false, private: false, access: { has: function (obj) { return "affiliateId" in obj; }, get: function (obj) { return obj.affiliateId; }, set: function (obj, value) { obj.affiliateId = value; } }, metadata: _metadata }, _affiliateId_initializers, _affiliateId_extraInitializers);
        __esDecorate(null, null, _referredUserId_decorators, { kind: "field", name: "referredUserId", static: false, private: false, access: { has: function (obj) { return "referredUserId" in obj; }, get: function (obj) { return obj.referredUserId; }, set: function (obj, value) { obj.referredUserId = value; } }, metadata: _metadata }, _referredUserId_initializers, _referredUserId_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _commissionAmount_decorators, { kind: "field", name: "commissionAmount", static: false, private: false, access: { has: function (obj) { return "commissionAmount" in obj; }, get: function (obj) { return obj.commissionAmount; }, set: function (obj, value) { obj.commissionAmount = value; } }, metadata: _metadata }, _commissionAmount_initializers, _commissionAmount_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _affiliate_decorators, { kind: "field", name: "affiliate", static: false, private: false, access: { has: function (obj) { return "affiliate" in obj; }, get: function (obj) { return obj.affiliate; }, set: function (obj, value) { obj.affiliate = value; } }, metadata: _metadata }, _affiliate_initializers, _affiliate_extraInitializers);
        __esDecorate(null, null, _referredUser_decorators, { kind: "field", name: "referredUser", static: false, private: false, access: { has: function (obj) { return "referredUser" in obj; }, get: function (obj) { return obj.referredUser; }, set: function (obj, value) { obj.referredUser = value; } }, metadata: _metadata }, _referredUser_initializers, _referredUser_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        AffiliateReferral = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return AffiliateReferral = _classThis;
}();
exports.AffiliateReferral = AffiliateReferral;
