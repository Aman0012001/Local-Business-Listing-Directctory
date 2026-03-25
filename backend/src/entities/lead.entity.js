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
exports.Lead = exports.LeadStatus = exports.LeadType = void 0;
var typeorm_1 = require("typeorm");
var class_transformer_1 = require("class-transformer");
var business_entity_1 = require("./business.entity");
var user_entity_1 = require("./user.entity");
var LeadType;
(function (LeadType) {
    LeadType["CALL"] = "call";
    LeadType["WHATSAPP"] = "whatsapp";
    LeadType["EMAIL"] = "email";
    LeadType["CHAT"] = "chat";
    LeadType["WEBSITE"] = "website";
})(LeadType || (exports.LeadType = LeadType = {}));
var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "new";
    LeadStatus["CONTACTED"] = "contacted";
    LeadStatus["CONVERTED"] = "converted";
    LeadStatus["LOST"] = "lost";
})(LeadStatus || (exports.LeadStatus = LeadStatus = {}));
var Lead = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('leads')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _businessId_decorators;
    var _businessId_initializers = [];
    var _businessId_extraInitializers = [];
    var _userId_decorators;
    var _userId_initializers = [];
    var _userId_extraInitializers = [];
    var _type_decorators;
    var _type_initializers = [];
    var _type_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _message_decorators;
    var _message_initializers = [];
    var _message_extraInitializers = [];
    var _source_decorators;
    var _source_initializers = [];
    var _source_extraInitializers = [];
    var _userAgent_decorators;
    var _userAgent_initializers = [];
    var _userAgent_extraInitializers = [];
    var _ipAddress_decorators;
    var _ipAddress_initializers = [];
    var _ipAddress_extraInitializers = [];
    var _referrer_decorators;
    var _referrer_initializers = [];
    var _referrer_extraInitializers = [];
    var _contactedAt_decorators;
    var _contactedAt_initializers = [];
    var _contactedAt_extraInitializers = [];
    var _convertedAt_decorators;
    var _convertedAt_initializers = [];
    var _convertedAt_extraInitializers = [];
    var _notes_decorators;
    var _notes_initializers = [];
    var _notes_extraInitializers = [];
    var _vendorReply_decorators;
    var _vendorReply_initializers = [];
    var _vendorReply_extraInitializers = [];
    var _vendorRepliedAt_decorators;
    var _vendorRepliedAt_initializers = [];
    var _vendorRepliedAt_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _business_decorators;
    var _business_initializers = [];
    var _business_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var Lead = _classThis = /** @class */ (function () {
        function Lead_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.businessId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _businessId_initializers, void 0));
            this.userId = (__runInitializers(this, _businessId_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
            // Lead Info
            this.type = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _type_initializers, void 0));
            this.status = (__runInitializers(this, _type_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            // Contact Info (for non-authenticated users)
            this.name = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.email = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
            this.message = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _message_initializers, void 0));
            // Metadata
            this.source = (__runInitializers(this, _message_extraInitializers), __runInitializers(this, _source_initializers, void 0));
            this.userAgent = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _userAgent_initializers, void 0));
            this.ipAddress = (__runInitializers(this, _userAgent_extraInitializers), __runInitializers(this, _ipAddress_initializers, void 0));
            this.referrer = (__runInitializers(this, _ipAddress_extraInitializers), __runInitializers(this, _referrer_initializers, void 0));
            // Tracking
            this.contactedAt = (__runInitializers(this, _referrer_extraInitializers), __runInitializers(this, _contactedAt_initializers, void 0));
            this.convertedAt = (__runInitializers(this, _contactedAt_extraInitializers), __runInitializers(this, _convertedAt_initializers, void 0));
            this.notes = (__runInitializers(this, _convertedAt_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
            // Vendor reply to enquiry
            this.vendorReply = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _vendorReply_initializers, void 0));
            this.vendorRepliedAt = (__runInitializers(this, _vendorReply_extraInitializers), __runInitializers(this, _vendorRepliedAt_initializers, void 0));
            this.createdAt = (__runInitializers(this, _vendorRepliedAt_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.business = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _business_initializers, void 0));
            this.user = (__runInitializers(this, _business_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            __runInitializers(this, _user_extraInitializers);
        }
        return Lead_1;
    }());
    __setFunctionName(_classThis, "Lead");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _businessId_decorators = [(0, typeorm_1.Column)({ name: 'business_id', type: 'uuid' }), (0, typeorm_1.Index)()];
        _userId_decorators = [(0, typeorm_1.Column)({ name: 'user_id', nullable: true, type: 'uuid' }), (0, typeorm_1.Index)()];
        _type_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: LeadType,
            }), (0, typeorm_1.Index)()];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: LeadStatus,
                default: LeadStatus.NEW,
            }), (0, typeorm_1.Index)()];
        _name_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _email_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _phone_decorators = [(0, typeorm_1.Column)({ nullable: true, length: 20 })];
        _message_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'text' })];
        _source_decorators = [(0, typeorm_1.Column)({ nullable: true, length: 50 })];
        _userAgent_decorators = [(0, typeorm_1.Column)({ name: 'user_agent', nullable: true, type: 'text' })];
        _ipAddress_decorators = [(0, typeorm_1.Column)({ name: 'ip_address', nullable: true, type: 'inet' })];
        _referrer_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'text' })];
        _contactedAt_decorators = [(0, typeorm_1.Column)({ name: 'contacted_at', nullable: true, type: 'timestamp' })];
        _convertedAt_decorators = [(0, typeorm_1.Column)({ name: 'converted_at', nullable: true, type: 'timestamp' })];
        _notes_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'text' })];
        _vendorReply_decorators = [(0, typeorm_1.Column)({ name: 'vendor_reply', nullable: true, type: 'text' })];
        _vendorRepliedAt_decorators = [(0, typeorm_1.Column)({ name: 'vendor_replied_at', nullable: true, type: 'timestamp' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' }), (0, typeorm_1.Index)()];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _business_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.ManyToOne)(function () { return business_entity_1.Listing; }, function (listing) { return listing.leads; }), (0, typeorm_1.JoinColumn)({ name: 'business_id' })];
        _user_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.ManyToOne)(function () { return user_entity_1.User; }, function (user) { return user.leads; }), (0, typeorm_1.JoinColumn)({ name: 'user_id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _businessId_decorators, { kind: "field", name: "businessId", static: false, private: false, access: { has: function (obj) { return "businessId" in obj; }, get: function (obj) { return obj.businessId; }, set: function (obj, value) { obj.businessId = value; } }, metadata: _metadata }, _businessId_initializers, _businessId_extraInitializers);
        __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: function (obj) { return "userId" in obj; }, get: function (obj) { return obj.userId; }, set: function (obj, value) { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
        __esDecorate(null, null, _type_decorators, { kind: "field", name: "type", static: false, private: false, access: { has: function (obj) { return "type" in obj; }, get: function (obj) { return obj.type; }, set: function (obj, value) { obj.type = value; } }, metadata: _metadata }, _type_initializers, _type_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
        __esDecorate(null, null, _message_decorators, { kind: "field", name: "message", static: false, private: false, access: { has: function (obj) { return "message" in obj; }, get: function (obj) { return obj.message; }, set: function (obj, value) { obj.message = value; } }, metadata: _metadata }, _message_initializers, _message_extraInitializers);
        __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: function (obj) { return "source" in obj; }, get: function (obj) { return obj.source; }, set: function (obj, value) { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
        __esDecorate(null, null, _userAgent_decorators, { kind: "field", name: "userAgent", static: false, private: false, access: { has: function (obj) { return "userAgent" in obj; }, get: function (obj) { return obj.userAgent; }, set: function (obj, value) { obj.userAgent = value; } }, metadata: _metadata }, _userAgent_initializers, _userAgent_extraInitializers);
        __esDecorate(null, null, _ipAddress_decorators, { kind: "field", name: "ipAddress", static: false, private: false, access: { has: function (obj) { return "ipAddress" in obj; }, get: function (obj) { return obj.ipAddress; }, set: function (obj, value) { obj.ipAddress = value; } }, metadata: _metadata }, _ipAddress_initializers, _ipAddress_extraInitializers);
        __esDecorate(null, null, _referrer_decorators, { kind: "field", name: "referrer", static: false, private: false, access: { has: function (obj) { return "referrer" in obj; }, get: function (obj) { return obj.referrer; }, set: function (obj, value) { obj.referrer = value; } }, metadata: _metadata }, _referrer_initializers, _referrer_extraInitializers);
        __esDecorate(null, null, _contactedAt_decorators, { kind: "field", name: "contactedAt", static: false, private: false, access: { has: function (obj) { return "contactedAt" in obj; }, get: function (obj) { return obj.contactedAt; }, set: function (obj, value) { obj.contactedAt = value; } }, metadata: _metadata }, _contactedAt_initializers, _contactedAt_extraInitializers);
        __esDecorate(null, null, _convertedAt_decorators, { kind: "field", name: "convertedAt", static: false, private: false, access: { has: function (obj) { return "convertedAt" in obj; }, get: function (obj) { return obj.convertedAt; }, set: function (obj, value) { obj.convertedAt = value; } }, metadata: _metadata }, _convertedAt_initializers, _convertedAt_extraInitializers);
        __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: function (obj) { return "notes" in obj; }, get: function (obj) { return obj.notes; }, set: function (obj, value) { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
        __esDecorate(null, null, _vendorReply_decorators, { kind: "field", name: "vendorReply", static: false, private: false, access: { has: function (obj) { return "vendorReply" in obj; }, get: function (obj) { return obj.vendorReply; }, set: function (obj, value) { obj.vendorReply = value; } }, metadata: _metadata }, _vendorReply_initializers, _vendorReply_extraInitializers);
        __esDecorate(null, null, _vendorRepliedAt_decorators, { kind: "field", name: "vendorRepliedAt", static: false, private: false, access: { has: function (obj) { return "vendorRepliedAt" in obj; }, get: function (obj) { return obj.vendorRepliedAt; }, set: function (obj, value) { obj.vendorRepliedAt = value; } }, metadata: _metadata }, _vendorRepliedAt_initializers, _vendorRepliedAt_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _business_decorators, { kind: "field", name: "business", static: false, private: false, access: { has: function (obj) { return "business" in obj; }, get: function (obj) { return obj.business; }, set: function (obj, value) { obj.business = value; } }, metadata: _metadata }, _business_initializers, _business_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Lead = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Lead = _classThis;
}();
exports.Lead = Lead;
