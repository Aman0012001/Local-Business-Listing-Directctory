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
exports.Affiliate = exports.AffiliateStatus = void 0;
var typeorm_1 = require("typeorm");
var user_entity_1 = require("./user.entity");
var referral_entity_1 = require("./referral.entity");
var payout_entity_1 = require("./payout.entity");
var AffiliateStatus;
(function (AffiliateStatus) {
    AffiliateStatus["ACTIVE"] = "active";
    AffiliateStatus["SUSPENDED"] = "suspended";
    AffiliateStatus["PENDING"] = "pending";
})(AffiliateStatus || (exports.AffiliateStatus = AffiliateStatus = {}));
var Affiliate = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('affiliates')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _referralCode_decorators;
    var _referralCode_initializers = [];
    var _referralCode_extraInitializers = [];
    var _totalEarnings_decorators;
    var _totalEarnings_initializers = [];
    var _totalEarnings_extraInitializers = [];
    var _totalWithdrawals_decorators;
    var _totalWithdrawals_initializers = [];
    var _totalWithdrawals_extraInitializers = [];
    var _balance_decorators;
    var _balance_initializers = [];
    var _balance_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var _referrals_decorators;
    var _referrals_initializers = [];
    var _referrals_extraInitializers = [];
    var _payouts_decorators;
    var _payouts_initializers = [];
    var _payouts_extraInitializers = [];
    var Affiliate = _classThis = /** @class */ (function () {
        function Affiliate_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            this.referralCode = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _referralCode_initializers, void 0));
            this.totalEarnings = (__runInitializers(this, _referralCode_extraInitializers), __runInitializers(this, _totalEarnings_initializers, void 0));
            this.totalWithdrawals = (__runInitializers(this, _totalEarnings_extraInitializers), __runInitializers(this, _totalWithdrawals_initializers, void 0));
            this.balance = (__runInitializers(this, _totalWithdrawals_extraInitializers), __runInitializers(this, _balance_initializers, void 0));
            this.status = (__runInitializers(this, _balance_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.createdAt = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.user = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.referrals = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _referrals_initializers, void 0));
            this.payouts = (__runInitializers(this, _referrals_extraInitializers), __runInitializers(this, _payouts_initializers, void 0));
            __runInitializers(this, _payouts_extraInitializers);
        }
        return Affiliate_1;
    }());
    __setFunctionName(_classThis, "Affiliate");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _userId_decorators = [(0, typeorm_1.Column)({ name: 'user_id' }), (0, typeorm_1.Index)({ unique: true })];
        _referralCode_decorators = [(0, typeorm_1.Column)({ name: 'referral_code', unique: true }), (0, typeorm_1.Index)()];
        _totalEarnings_decorators = [(0, typeorm_1.Column)({ name: 'total_earnings', type: 'decimal', precision: 10, scale: 2, default: 0 })];
        _totalWithdrawals_decorators = [(0, typeorm_1.Column)({ name: 'total_withdrawals', type: 'decimal', precision: 10, scale: 2, default: 0 })];
        _balance_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 })];
        _status_decorators = [(0, typeorm_1.Column)({ default: 'active' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _user_decorators = [(0, typeorm_1.OneToOne)(function () { return user_entity_1.User; }, function (user) { return user.affiliate; }), (0, typeorm_1.JoinColumn)({ name: 'user_id' })];
        _referrals_decorators = [(0, typeorm_1.OneToMany)(function () { return referral_entity_1.AffiliateReferral; }, function (referral) { return referral.affiliate; })];
        _payouts_decorators = [(0, typeorm_1.OneToMany)(function () { return payout_entity_1.Payout; }, function (payout) { return payout.affiliate; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _referralCode_decorators, { kind: "field", name: "referralCode", static: false, private: false, access: { has: function (obj) { return "referralCode" in obj; }, get: function (obj) { return obj.referralCode; }, set: function (obj, value) { obj.referralCode = value; } }, metadata: _metadata }, _referralCode_initializers, _referralCode_extraInitializers);
        __esDecorate(null, null, _totalEarnings_decorators, { kind: "field", name: "totalEarnings", static: false, private: false, access: { has: function (obj) { return "totalEarnings" in obj; }, get: function (obj) { return obj.totalEarnings; }, set: function (obj, value) { obj.totalEarnings = value; } }, metadata: _metadata }, _totalEarnings_initializers, _totalEarnings_extraInitializers);
        __esDecorate(null, null, _totalWithdrawals_decorators, { kind: "field", name: "totalWithdrawals", static: false, private: false, access: { has: function (obj) { return "totalWithdrawals" in obj; }, get: function (obj) { return obj.totalWithdrawals; }, set: function (obj, value) { obj.totalWithdrawals = value; } }, metadata: _metadata }, _totalWithdrawals_initializers, _totalWithdrawals_extraInitializers);
        __esDecorate(null, null, _balance_decorators, { kind: "field", name: "balance", static: false, private: false, access: { has: function (obj) { return "balance" in obj; }, get: function (obj) { return obj.balance; }, set: function (obj, value) { obj.balance = value; } }, metadata: _metadata }, _balance_initializers, _balance_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _referrals_decorators, { kind: "field", name: "referrals", static: false, private: false, access: { has: function (obj) { return "referrals" in obj; }, get: function (obj) { return obj.referrals; }, set: function (obj, value) { obj.referrals = value; } }, metadata: _metadata }, _referrals_initializers, _referrals_extraInitializers);
        __esDecorate(null, null, _payouts_decorators, { kind: "field", name: "payouts", static: false, private: false, access: { has: function (obj) { return "payouts" in obj; }, get: function (obj) { return obj.payouts; }, set: function (obj, value) { obj.payouts = value; } }, metadata: _metadata }, _payouts_initializers, _payouts_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Affiliate = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Affiliate = _classThis;
}();
exports.Affiliate = Affiliate;
