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
exports.CommentReply = void 0;
var typeorm_1 = require("typeorm");
var class_transformer_1 = require("class-transformer");
var comment_entity_1 = require("./comment.entity");
var vendor_entity_1 = require("./vendor.entity");
var CommentReply = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('comment_replies')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _commentId_decorators;
    var _commentId_initializers = [];
    var _commentId_extraInitializers = [];
    var _vendorId_decorators;
    var _vendorId_initializers = [];
    var _vendorId_extraInitializers = [];
    var _replyText_decorators;
    var _replyText_initializers = [];
    var _replyText_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _comment_decorators;
    var _comment_initializers = [];
    var _comment_extraInitializers = [];
    var _vendor_decorators;
    var _vendor_initializers = [];
    var _vendor_extraInitializers = [];
    var CommentReply = _classThis = /** @class */ (function () {
        function CommentReply_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.commentId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _commentId_initializers, void 0));
            this.vendorId = (__runInitializers(this, _commentId_extraInitializers), __runInitializers(this, _vendorId_initializers, void 0));
            this.replyText = (__runInitializers(this, _vendorId_extraInitializers), __runInitializers(this, _replyText_initializers, void 0));
            this.createdAt = (__runInitializers(this, _replyText_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.comment = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _comment_initializers, void 0));
            this.vendor = (__runInitializers(this, _comment_extraInitializers), __runInitializers(this, _vendor_initializers, void 0));
            __runInitializers(this, _vendor_extraInitializers);
        }
        return CommentReply_1;
    }());
    __setFunctionName(_classThis, "CommentReply");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _commentId_decorators = [(0, typeorm_1.Column)({ name: 'comment_id' })];
        _vendorId_decorators = [(0, typeorm_1.Column)({ name: 'vendor_id' })];
        _replyText_decorators = [(0, typeorm_1.Column)({ name: 'reply_text', type: 'text' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _comment_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToOne)(function () { return comment_entity_1.Comment; }, function (comment) { return comment.reply; }, { onDelete: 'CASCADE' }), (0, typeorm_1.JoinColumn)({ name: 'comment_id' })];
        _vendor_decorators = [(0, typeorm_1.ManyToOne)(function () { return vendor_entity_1.Vendor; }, function (vendor) { return vendor.replies; }), (0, typeorm_1.JoinColumn)({ name: 'vendor_id' })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _commentId_decorators, { kind: "field", name: "commentId", static: false, private: false, access: { has: function (obj) { return "commentId" in obj; }, get: function (obj) { return obj.commentId; }, set: function (obj, value) { obj.commentId = value; } }, metadata: _metadata }, _commentId_initializers, _commentId_extraInitializers);
        __esDecorate(null, null, _vendorId_decorators, { kind: "field", name: "vendorId", static: false, private: false, access: { has: function (obj) { return "vendorId" in obj; }, get: function (obj) { return obj.vendorId; }, set: function (obj, value) { obj.vendorId = value; } }, metadata: _metadata }, _vendorId_initializers, _vendorId_extraInitializers);
        __esDecorate(null, null, _replyText_decorators, { kind: "field", name: "replyText", static: false, private: false, access: { has: function (obj) { return "replyText" in obj; }, get: function (obj) { return obj.replyText; }, set: function (obj, value) { obj.replyText = value; } }, metadata: _metadata }, _replyText_initializers, _replyText_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _comment_decorators, { kind: "field", name: "comment", static: false, private: false, access: { has: function (obj) { return "comment" in obj; }, get: function (obj) { return obj.comment; }, set: function (obj, value) { obj.comment = value; } }, metadata: _metadata }, _comment_initializers, _comment_extraInitializers);
        __esDecorate(null, null, _vendor_decorators, { kind: "field", name: "vendor", static: false, private: false, access: { has: function (obj) { return "vendor" in obj; }, get: function (obj) { return obj.vendor; }, set: function (obj, value) { obj.vendor = value; } }, metadata: _metadata }, _vendor_initializers, _vendor_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        CommentReply = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return CommentReply = _classThis;
}();
exports.CommentReply = CommentReply;
