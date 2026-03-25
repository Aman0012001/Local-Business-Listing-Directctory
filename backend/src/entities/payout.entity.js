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
exports.Payout = exports.PayoutStatus = void 0;
var typeorm_1 = require("typeorm");
var affiliate_entity_1 = require("./affiliate.entity");
var PayoutStatus;
(function (PayoutStatus) {
    PayoutStatus["PENDING"] = "pending";
    PayoutStatus["APPROVED"] = "approved";
    PayoutStatus["REJECTED"] = "rejected";
    PayoutStatus["PAID"] = "paid";
})(PayoutStatus || (exports.PayoutStatus = PayoutStatus = {}));
var Payout = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('payouts')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _affiliateId_decorators;
    var _affiliateId_initializers = [];
    var _affiliateId_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _paymentMethod_decorators;
    var _paymentMethod_initializers = [];
    var _paymentMethod_extraInitializers = [];
    var _paymentDetails_decorators;
    var _paymentDetails_initializers = [];
    var _paymentDetails_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _adminNotes_decorators;
    var _adminNotes_initializers = [];
    var _adminNotes_extraInitializers = [];
    var _processedAt_decorators;
    var _processedAt_initializers = [];
    var _processedAt_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _affiliate_decorators;
    var _affiliate_initializers = [];
    var _affiliate_extraInitializers = [];
    var Payout = _classThis = /** @class */ (function () {
        function Payout_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.affiliateId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _affiliateId_initializers, void 0));
            this.amount = (__runInitializers(this, _affiliateId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
            this.paymentMethod = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
            this.paymentDetails = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _paymentDetails_initializers, void 0));
            this.status = (__runInitializers(this, _paymentDetails_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.adminNotes = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _adminNotes_initializers, void 0));
            this.processedAt = (__runInitializers(this, _adminNotes_extraInitializers), __runInitializers(this, _processedAt_initializers, void 0));
            this.createdAt = (__runInitializers(this, _processedAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.affiliate = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _affiliate_initializers, void 0));
            __runInitializers(this, _affiliate_extraInitializers);
        }
        return Payout_1;
    }());
    __setFunctionName(_classThis, "Payout");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _affiliateId_decorators = [(0, typeorm_1.Column)({ name: 'affiliate_id', type: 'uuid' })];
        _amount_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 })];
        _paymentMethod_decorators = [(0, typeorm_1.Column)({ name: 'payment_method', length: 50 })];
        _paymentDetails_decorators = [(0, typeorm_1.Column)({ name: 'payment_details', type: 'text' })];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: PayoutStatus,
                default: PayoutStatus.PENDING,
            })];
        _adminNotes_decorators = [(0, typeorm_1.Column)({ name: 'admin_notes', type: 'text', nullable: true })];
        _processedAt_decorators = [(0, typeorm_1.Column)({ name: 'processed_at', type: 'timestamp', nullable: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _affiliate_decorators = [(0, typeorm_1.ManyToOne)(function () { return affiliate_entity_1.Affiliate; }, function (affiliate) { return affiliate.payouts; }), (0, typeorm_1.JoinColumn)({ name: 'affiliate_id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _affiliateId_decorators, { kind: "field", name: "affiliateId", static: false, private: false, access: { has: function (obj) { return "affiliateId" in obj; }, get: function (obj) { return obj.affiliateId; }, set: function (obj, value) { obj.affiliateId = value; } }, metadata: _metadata }, _affiliateId_initializers, _affiliateId_extraInitializers);
        __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
        __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: function (obj) { return "paymentMethod" in obj; }, get: function (obj) { return obj.paymentMethod; }, set: function (obj, value) { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
        __esDecorate(null, null, _paymentDetails_decorators, { kind: "field", name: "paymentDetails", static: false, private: false, access: { has: function (obj) { return "paymentDetails" in obj; }, get: function (obj) { return obj.paymentDetails; }, set: function (obj, value) { obj.paymentDetails = value; } }, metadata: _metadata }, _paymentDetails_initializers, _paymentDetails_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _adminNotes_decorators, { kind: "field", name: "adminNotes", static: false, private: false, access: { has: function (obj) { return "adminNotes" in obj; }, get: function (obj) { return obj.adminNotes; }, set: function (obj, value) { obj.adminNotes = value; } }, metadata: _metadata }, _adminNotes_initializers, _adminNotes_extraInitializers);
        __esDecorate(null, null, _processedAt_decorators, { kind: "field", name: "processedAt", static: false, private: false, access: { has: function (obj) { return "processedAt" in obj; }, get: function (obj) { return obj.processedAt; }, set: function (obj, value) { obj.processedAt = value; } }, metadata: _metadata }, _processedAt_initializers, _processedAt_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _affiliate_decorators, { kind: "field", name: "affiliate", static: false, private: false, access: { has: function (obj) { return "affiliate" in obj; }, get: function (obj) { return obj.affiliate; }, set: function (obj, value) { obj.affiliate = value; } }, metadata: _metadata }, _affiliate_initializers, _affiliate_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Payout = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Payout = _classThis;
}();
exports.Payout = Payout;
