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
exports.SubscriptionPlan = exports.SubscriptionPlanType = void 0;
var typeorm_1 = require("typeorm");
var subscription_entity_1 = require("./subscription.entity");
var SubscriptionPlanType;
(function (SubscriptionPlanType) {
    SubscriptionPlanType["FREE"] = "free";
    SubscriptionPlanType["BASIC"] = "basic";
    SubscriptionPlanType["PREMIUM"] = "premium";
    SubscriptionPlanType["ENTERPRISE"] = "enterprise";
})(SubscriptionPlanType || (exports.SubscriptionPlanType = SubscriptionPlanType = {}));
var SubscriptionPlan = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('subscription_plans')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _planType_decorators;
    var _planType_initializers = [];
    var _planType_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _price_decorators;
    var _price_initializers = [];
    var _price_extraInitializers = [];
    var _billingCycle_decorators;
    var _billingCycle_initializers = [];
    var _billingCycle_extraInitializers = [];
    var _maxListings_decorators;
    var _maxListings_initializers = [];
    var _maxListings_extraInitializers = [];
    var _isFeatured_decorators;
    var _isFeatured_initializers = [];
    var _isFeatured_extraInitializers = [];
    var _dashboardFeatures_decorators;
    var _dashboardFeatures_initializers = [];
    var _dashboardFeatures_extraInitializers = [];
    var _isActive_decorators;
    var _isActive_initializers = [];
    var _isActive_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _subscriptions_decorators;
    var _subscriptions_initializers = [];
    var _subscriptions_extraInitializers = [];
    var SubscriptionPlan = _classThis = /** @class */ (function () {
        function SubscriptionPlan_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.planType = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _planType_initializers, void 0));
            this.description = (__runInitializers(this, _planType_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.price = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _price_initializers, void 0));
            this.billingCycle = (__runInitializers(this, _price_extraInitializers), __runInitializers(this, _billingCycle_initializers, void 0));
            this.maxListings = (__runInitializers(this, _billingCycle_extraInitializers), __runInitializers(this, _maxListings_initializers, void 0));
            this.isFeatured = (__runInitializers(this, _maxListings_extraInitializers), __runInitializers(this, _isFeatured_initializers, void 0));
            this.dashboardFeatures = (__runInitializers(this, _isFeatured_extraInitializers), __runInitializers(this, _dashboardFeatures_initializers, void 0));
            this.isActive = (__runInitializers(this, _dashboardFeatures_extraInitializers), __runInitializers(this, _isActive_initializers, void 0));
            this.createdAt = (__runInitializers(this, _isActive_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.subscriptions = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _subscriptions_initializers, void 0));
            __runInitializers(this, _subscriptions_extraInitializers);
        }
        return SubscriptionPlan_1;
    }());
    __setFunctionName(_classThis, "SubscriptionPlan");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)({ length: 100 })];
        _planType_decorators = [(0, typeorm_1.Column)({
                name: 'plan_type',
                type: 'enum',
                enum: SubscriptionPlanType,
            })];
        _description_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'text' })];
        _price_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 })];
        _billingCycle_decorators = [(0, typeorm_1.Column)({ name: 'billing_cycle', length: 20, default: 'monthly' })];
        _maxListings_decorators = [(0, typeorm_1.Column)({ name: 'max_listings', default: 1 })];
        _isFeatured_decorators = [(0, typeorm_1.Column)({ name: 'is_featured', default: false })];
        _dashboardFeatures_decorators = [(0, typeorm_1.Column)({ name: 'dashboard_features', type: 'jsonb', default: {} })];
        _isActive_decorators = [(0, typeorm_1.Column)({ name: 'is_active', default: true })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _subscriptions_decorators = [(0, typeorm_1.OneToMany)(function () { return subscription_entity_1.Subscription; }, function (subscription) { return subscription.plan; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _planType_decorators, { kind: "field", name: "planType", static: false, private: false, access: { has: function (obj) { return "planType" in obj; }, get: function (obj) { return obj.planType; }, set: function (obj, value) { obj.planType = value; } }, metadata: _metadata }, _planType_initializers, _planType_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _price_decorators, { kind: "field", name: "price", static: false, private: false, access: { has: function (obj) { return "price" in obj; }, get: function (obj) { return obj.price; }, set: function (obj, value) { obj.price = value; } }, metadata: _metadata }, _price_initializers, _price_extraInitializers);
        __esDecorate(null, null, _billingCycle_decorators, { kind: "field", name: "billingCycle", static: false, private: false, access: { has: function (obj) { return "billingCycle" in obj; }, get: function (obj) { return obj.billingCycle; }, set: function (obj, value) { obj.billingCycle = value; } }, metadata: _metadata }, _billingCycle_initializers, _billingCycle_extraInitializers);
        __esDecorate(null, null, _maxListings_decorators, { kind: "field", name: "maxListings", static: false, private: false, access: { has: function (obj) { return "maxListings" in obj; }, get: function (obj) { return obj.maxListings; }, set: function (obj, value) { obj.maxListings = value; } }, metadata: _metadata }, _maxListings_initializers, _maxListings_extraInitializers);
        __esDecorate(null, null, _isFeatured_decorators, { kind: "field", name: "isFeatured", static: false, private: false, access: { has: function (obj) { return "isFeatured" in obj; }, get: function (obj) { return obj.isFeatured; }, set: function (obj, value) { obj.isFeatured = value; } }, metadata: _metadata }, _isFeatured_initializers, _isFeatured_extraInitializers);
        __esDecorate(null, null, _dashboardFeatures_decorators, { kind: "field", name: "dashboardFeatures", static: false, private: false, access: { has: function (obj) { return "dashboardFeatures" in obj; }, get: function (obj) { return obj.dashboardFeatures; }, set: function (obj, value) { obj.dashboardFeatures = value; } }, metadata: _metadata }, _dashboardFeatures_initializers, _dashboardFeatures_extraInitializers);
        __esDecorate(null, null, _isActive_decorators, { kind: "field", name: "isActive", static: false, private: false, access: { has: function (obj) { return "isActive" in obj; }, get: function (obj) { return obj.isActive; }, set: function (obj, value) { obj.isActive = value; } }, metadata: _metadata }, _isActive_initializers, _isActive_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _subscriptions_decorators, { kind: "field", name: "subscriptions", static: false, private: false, access: { has: function (obj) { return "subscriptions" in obj; }, get: function (obj) { return obj.subscriptions; }, set: function (obj, value) { obj.subscriptions = value; } }, metadata: _metadata }, _subscriptions_initializers, _subscriptions_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SubscriptionPlan = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SubscriptionPlan = _classThis;
}();
exports.SubscriptionPlan = SubscriptionPlan;
