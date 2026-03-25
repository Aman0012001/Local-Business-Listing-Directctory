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
exports.Transaction = exports.PaymentStatus = void 0;
var typeorm_1 = require("typeorm");
var subscription_entity_1 = require("./subscription.entity");
var vendor_entity_1 = require("./vendor.entity");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var Transaction = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('transactions')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _subscriptionId_decorators;
    var _subscriptionId_initializers = [];
    var _subscriptionId_extraInitializers = [];
    var _vendorId_decorators;
    var _vendorId_initializers = [];
    var _vendorId_extraInitializers = [];
    var _amount_decorators;
    var _amount_initializers = [];
    var _amount_extraInitializers = [];
    var _currency_decorators;
    var _currency_initializers = [];
    var _currency_extraInitializers = [];
    var _paymentMethod_decorators;
    var _paymentMethod_initializers = [];
    var _paymentMethod_extraInitializers = [];
    var _paymentGateway_decorators;
    var _paymentGateway_initializers = [];
    var _paymentGateway_extraInitializers = [];
    var _gatewayTransactionId_decorators;
    var _gatewayTransactionId_initializers = [];
    var _gatewayTransactionId_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _invoiceNumber_decorators;
    var _invoiceNumber_initializers = [];
    var _invoiceNumber_extraInitializers = [];
    var _invoiceUrl_decorators;
    var _invoiceUrl_initializers = [];
    var _invoiceUrl_extraInitializers = [];
    var _metadata_decorators;
    var _metadata_initializers = [];
    var _metadata_extraInitializers = [];
    var _paidAt_decorators;
    var _paidAt_initializers = [];
    var _paidAt_extraInitializers = [];
    var _failedAt_decorators;
    var _failedAt_initializers = [];
    var _failedAt_extraInitializers = [];
    var _refundedAt_decorators;
    var _refundedAt_initializers = [];
    var _refundedAt_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _subscription_decorators;
    var _subscription_initializers = [];
    var _subscription_extraInitializers = [];
    var _vendor_decorators;
    var _vendor_initializers = [];
    var _vendor_extraInitializers = [];
    var Transaction = _classThis = /** @class */ (function () {
        function Transaction_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.subscriptionId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _subscriptionId_initializers, void 0));
            this.vendorId = (__runInitializers(this, _subscriptionId_extraInitializers), __runInitializers(this, _vendorId_initializers, void 0));
            // Payment Details
            this.amount = (__runInitializers(this, _vendorId_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
            this.currency = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
            this.paymentMethod = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _paymentMethod_initializers, void 0));
            this.paymentGateway = (__runInitializers(this, _paymentMethod_extraInitializers), __runInitializers(this, _paymentGateway_initializers, void 0));
            this.gatewayTransactionId = (__runInitializers(this, _paymentGateway_extraInitializers), __runInitializers(this, _gatewayTransactionId_initializers, void 0));
            // Status
            this.status = (__runInitializers(this, _gatewayTransactionId_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            // Invoice
            this.invoiceNumber = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _invoiceNumber_initializers, void 0));
            this.invoiceUrl = (__runInitializers(this, _invoiceNumber_extraInitializers), __runInitializers(this, _invoiceUrl_initializers, void 0));
            // Metadata
            this.metadata = (__runInitializers(this, _invoiceUrl_extraInitializers), __runInitializers(this, _metadata_initializers, void 0));
            // Timestamps
            this.paidAt = (__runInitializers(this, _metadata_extraInitializers), __runInitializers(this, _paidAt_initializers, void 0));
            this.failedAt = (__runInitializers(this, _paidAt_extraInitializers), __runInitializers(this, _failedAt_initializers, void 0));
            this.refundedAt = (__runInitializers(this, _failedAt_extraInitializers), __runInitializers(this, _refundedAt_initializers, void 0));
            this.createdAt = (__runInitializers(this, _refundedAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.subscription = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _subscription_initializers, void 0));
            this.vendor = (__runInitializers(this, _subscription_extraInitializers), __runInitializers(this, _vendor_initializers, void 0));
            __runInitializers(this, _vendor_extraInitializers);
        }
        return Transaction_1;
    }());
    __setFunctionName(_classThis, "Transaction");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _subscriptionId_decorators = [(0, typeorm_1.Column)({ name: 'subscription_id', type: 'uuid' }), (0, typeorm_1.Index)()];
        _vendorId_decorators = [(0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' }), (0, typeorm_1.Index)()];
        _amount_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 })];
        _currency_decorators = [(0, typeorm_1.Column)({ length: 3, default: 'INR' })];
        _paymentMethod_decorators = [(0, typeorm_1.Column)({ name: 'payment_method', nullable: true, length: 50 })];
        _paymentGateway_decorators = [(0, typeorm_1.Column)({ name: 'payment_gateway', nullable: true, length: 50 })];
        _gatewayTransactionId_decorators = [(0, typeorm_1.Column)({ name: 'gateway_transaction_id', nullable: true })];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: PaymentStatus,
                default: PaymentStatus.PENDING,
            }), (0, typeorm_1.Index)()];
        _invoiceNumber_decorators = [(0, typeorm_1.Column)({ name: 'invoice_number', nullable: true, unique: true, length: 50 }), (0, typeorm_1.Index)()];
        _invoiceUrl_decorators = [(0, typeorm_1.Column)({ name: 'invoice_url', nullable: true, type: 'text' })];
        _metadata_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'jsonb' })];
        _paidAt_decorators = [(0, typeorm_1.Column)({ name: 'paid_at', nullable: true, type: 'timestamp' })];
        _failedAt_decorators = [(0, typeorm_1.Column)({ name: 'failed_at', nullable: true, type: 'timestamp' })];
        _refundedAt_decorators = [(0, typeorm_1.Column)({ name: 'refunded_at', nullable: true, type: 'timestamp' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _subscription_decorators = [(0, typeorm_1.ManyToOne)(function () { return subscription_entity_1.Subscription; }, function (subscription) { return subscription.transactions; }), (0, typeorm_1.JoinColumn)({ name: 'subscription_id' })];
        _vendor_decorators = [(0, typeorm_1.ManyToOne)(function () { return vendor_entity_1.Vendor; }, function (vendor) { return vendor.transactions; }), (0, typeorm_1.JoinColumn)({ name: 'vendor_id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _subscriptionId_decorators, { kind: "field", name: "subscriptionId", static: false, private: false, access: { has: function (obj) { return "subscriptionId" in obj; }, get: function (obj) { return obj.subscriptionId; }, set: function (obj, value) { obj.subscriptionId = value; } }, metadata: _metadata }, _subscriptionId_initializers, _subscriptionId_extraInitializers);
        __esDecorate(null, null, _vendorId_decorators, { kind: "field", name: "vendorId", static: false, private: false, access: { has: function (obj) { return "vendorId" in obj; }, get: function (obj) { return obj.vendorId; }, set: function (obj, value) { obj.vendorId = value; } }, metadata: _metadata }, _vendorId_initializers, _vendorId_extraInitializers);
        __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: function (obj) { return "amount" in obj; }, get: function (obj) { return obj.amount; }, set: function (obj, value) { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
        __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: function (obj) { return "currency" in obj; }, get: function (obj) { return obj.currency; }, set: function (obj, value) { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
        __esDecorate(null, null, _paymentMethod_decorators, { kind: "field", name: "paymentMethod", static: false, private: false, access: { has: function (obj) { return "paymentMethod" in obj; }, get: function (obj) { return obj.paymentMethod; }, set: function (obj, value) { obj.paymentMethod = value; } }, metadata: _metadata }, _paymentMethod_initializers, _paymentMethod_extraInitializers);
        __esDecorate(null, null, _paymentGateway_decorators, { kind: "field", name: "paymentGateway", static: false, private: false, access: { has: function (obj) { return "paymentGateway" in obj; }, get: function (obj) { return obj.paymentGateway; }, set: function (obj, value) { obj.paymentGateway = value; } }, metadata: _metadata }, _paymentGateway_initializers, _paymentGateway_extraInitializers);
        __esDecorate(null, null, _gatewayTransactionId_decorators, { kind: "field", name: "gatewayTransactionId", static: false, private: false, access: { has: function (obj) { return "gatewayTransactionId" in obj; }, get: function (obj) { return obj.gatewayTransactionId; }, set: function (obj, value) { obj.gatewayTransactionId = value; } }, metadata: _metadata }, _gatewayTransactionId_initializers, _gatewayTransactionId_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _invoiceNumber_decorators, { kind: "field", name: "invoiceNumber", static: false, private: false, access: { has: function (obj) { return "invoiceNumber" in obj; }, get: function (obj) { return obj.invoiceNumber; }, set: function (obj, value) { obj.invoiceNumber = value; } }, metadata: _metadata }, _invoiceNumber_initializers, _invoiceNumber_extraInitializers);
        __esDecorate(null, null, _invoiceUrl_decorators, { kind: "field", name: "invoiceUrl", static: false, private: false, access: { has: function (obj) { return "invoiceUrl" in obj; }, get: function (obj) { return obj.invoiceUrl; }, set: function (obj, value) { obj.invoiceUrl = value; } }, metadata: _metadata }, _invoiceUrl_initializers, _invoiceUrl_extraInitializers);
        __esDecorate(null, null, _metadata_decorators, { kind: "field", name: "metadata", static: false, private: false, access: { has: function (obj) { return "metadata" in obj; }, get: function (obj) { return obj.metadata; }, set: function (obj, value) { obj.metadata = value; } }, metadata: _metadata }, _metadata_initializers, _metadata_extraInitializers);
        __esDecorate(null, null, _paidAt_decorators, { kind: "field", name: "paidAt", static: false, private: false, access: { has: function (obj) { return "paidAt" in obj; }, get: function (obj) { return obj.paidAt; }, set: function (obj, value) { obj.paidAt = value; } }, metadata: _metadata }, _paidAt_initializers, _paidAt_extraInitializers);
        __esDecorate(null, null, _failedAt_decorators, { kind: "field", name: "failedAt", static: false, private: false, access: { has: function (obj) { return "failedAt" in obj; }, get: function (obj) { return obj.failedAt; }, set: function (obj, value) { obj.failedAt = value; } }, metadata: _metadata }, _failedAt_initializers, _failedAt_extraInitializers);
        __esDecorate(null, null, _refundedAt_decorators, { kind: "field", name: "refundedAt", static: false, private: false, access: { has: function (obj) { return "refundedAt" in obj; }, get: function (obj) { return obj.refundedAt; }, set: function (obj, value) { obj.refundedAt = value; } }, metadata: _metadata }, _refundedAt_initializers, _refundedAt_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _subscription_decorators, { kind: "field", name: "subscription", static: false, private: false, access: { has: function (obj) { return "subscription" in obj; }, get: function (obj) { return obj.subscription; }, set: function (obj, value) { obj.subscription = value; } }, metadata: _metadata }, _subscription_initializers, _subscription_extraInitializers);
        __esDecorate(null, null, _vendor_decorators, { kind: "field", name: "vendor", static: false, private: false, access: { has: function (obj) { return "vendor" in obj; }, get: function (obj) { return obj.vendor; }, set: function (obj, value) { obj.vendor = value; } }, metadata: _metadata }, _vendor_initializers, _vendor_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Transaction = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Transaction = _classThis;
}();
exports.Transaction = Transaction;
