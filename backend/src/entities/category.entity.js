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
exports.Category = exports.CategorySource = exports.CategoryStatus = void 0;
var typeorm_1 = require("typeorm");
var class_transformer_1 = require("class-transformer");
var business_entity_1 = require("./business.entity");
var CategoryStatus;
(function (CategoryStatus) {
    CategoryStatus["ACTIVE"] = "active";
    CategoryStatus["DISABLED"] = "disabled";
})(CategoryStatus || (exports.CategoryStatus = CategoryStatus = {}));
var CategorySource;
(function (CategorySource) {
    CategorySource["GOOGLE"] = "google";
    CategorySource["ADMIN"] = "admin";
})(CategorySource || (exports.CategorySource = CategorySource = {}));
var Category = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('categories')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _name_decorators;
    var _name_initializers = [];
    var _name_extraInitializers = [];
    var _slug_decorators;
    var _slug_initializers = [];
    var _slug_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _icon_decorators;
    var _icon_initializers = [];
    var _icon_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _parentId_decorators;
    var _parentId_initializers = [];
    var _parentId_extraInitializers = [];
    var _displayOrder_decorators;
    var _displayOrder_initializers = [];
    var _displayOrder_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _source_decorators;
    var _source_initializers = [];
    var _source_extraInitializers = [];
    var _metaTitle_decorators;
    var _metaTitle_initializers = [];
    var _metaTitle_extraInitializers = [];
    var _metaDescription_decorators;
    var _metaDescription_initializers = [];
    var _metaDescription_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _parent_decorators;
    var _parent_initializers = [];
    var _parent_extraInitializers = [];
    var _subcategories_decorators;
    var _subcategories_initializers = [];
    var _subcategories_extraInitializers = [];
    var _businesses_decorators;
    var _businesses_initializers = [];
    var _businesses_extraInitializers = [];
    var Category = _classThis = /** @class */ (function () {
        function Category_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.name = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _name_initializers, void 0));
            this.slug = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
            this.description = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.icon = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _icon_initializers, void 0));
            this.imageUrl = (__runInitializers(this, _icon_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
            this.parentId = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _parentId_initializers, void 0));
            this.displayOrder = (__runInitializers(this, _parentId_extraInitializers), __runInitializers(this, _displayOrder_initializers, void 0));
            this.status = (__runInitializers(this, _displayOrder_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.source = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _source_initializers, void 0));
            this.metaTitle = (__runInitializers(this, _source_extraInitializers), __runInitializers(this, _metaTitle_initializers, void 0));
            this.metaDescription = (__runInitializers(this, _metaTitle_extraInitializers), __runInitializers(this, _metaDescription_initializers, void 0));
            this.createdAt = (__runInitializers(this, _metaDescription_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.parent = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _parent_initializers, void 0));
            this.subcategories = (__runInitializers(this, _parent_extraInitializers), __runInitializers(this, _subcategories_initializers, void 0));
            this.businesses = (__runInitializers(this, _subcategories_extraInitializers), __runInitializers(this, _businesses_initializers, void 0));
            __runInitializers(this, _businesses_extraInitializers);
        }
        return Category_1;
    }());
    __setFunctionName(_classThis, "Category");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _name_decorators = [(0, typeorm_1.Column)({ unique: true, length: 100 }), (0, typeorm_1.Index)()];
        _slug_decorators = [(0, typeorm_1.Column)({ unique: true, length: 100 }), (0, typeorm_1.Index)()];
        _description_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'text' })];
        _icon_decorators = [(0, typeorm_1.Column)({ name: 'icon', nullable: true, type: 'text' })];
        _imageUrl_decorators = [(0, typeorm_1.Column)({ name: 'image_url', nullable: true, type: 'text' })];
        _parentId_decorators = [(0, typeorm_1.Column)({ name: 'parent_id', nullable: true, type: 'uuid' })];
        _displayOrder_decorators = [(0, typeorm_1.Column)({ name: 'display_order', default: 0 })];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: CategoryStatus,
                default: CategoryStatus.ACTIVE,
            }), (0, typeorm_1.Index)()];
        _source_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: CategorySource,
                default: CategorySource.ADMIN,
            }), (0, typeorm_1.Index)()];
        _metaTitle_decorators = [(0, typeorm_1.Column)({ name: 'meta_title', nullable: true })];
        _metaDescription_decorators = [(0, typeorm_1.Column)({ name: 'meta_description', nullable: true, type: 'text' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _parent_decorators = [(0, typeorm_1.ManyToOne)(function () { return Category; }, function (category) { return category.subcategories; }), (0, typeorm_1.JoinColumn)({ name: 'parent_id' })];
        _subcategories_decorators = [(0, typeorm_1.OneToMany)(function () { return Category; }, function (category) { return category.parent; })];
        _businesses_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToMany)(function () { return business_entity_1.Listing; }, function (listing) { return listing.category; })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; }, set: function (obj, value) { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
        __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: function (obj) { return "slug" in obj; }, get: function (obj) { return obj.slug; }, set: function (obj, value) { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _icon_decorators, { kind: "field", name: "icon", static: false, private: false, access: { has: function (obj) { return "icon" in obj; }, get: function (obj) { return obj.icon; }, set: function (obj, value) { obj.icon = value; } }, metadata: _metadata }, _icon_initializers, _icon_extraInitializers);
        __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
        __esDecorate(null, null, _parentId_decorators, { kind: "field", name: "parentId", static: false, private: false, access: { has: function (obj) { return "parentId" in obj; }, get: function (obj) { return obj.parentId; }, set: function (obj, value) { obj.parentId = value; } }, metadata: _metadata }, _parentId_initializers, _parentId_extraInitializers);
        __esDecorate(null, null, _displayOrder_decorators, { kind: "field", name: "displayOrder", static: false, private: false, access: { has: function (obj) { return "displayOrder" in obj; }, get: function (obj) { return obj.displayOrder; }, set: function (obj, value) { obj.displayOrder = value; } }, metadata: _metadata }, _displayOrder_initializers, _displayOrder_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _source_decorators, { kind: "field", name: "source", static: false, private: false, access: { has: function (obj) { return "source" in obj; }, get: function (obj) { return obj.source; }, set: function (obj, value) { obj.source = value; } }, metadata: _metadata }, _source_initializers, _source_extraInitializers);
        __esDecorate(null, null, _metaTitle_decorators, { kind: "field", name: "metaTitle", static: false, private: false, access: { has: function (obj) { return "metaTitle" in obj; }, get: function (obj) { return obj.metaTitle; }, set: function (obj, value) { obj.metaTitle = value; } }, metadata: _metadata }, _metaTitle_initializers, _metaTitle_extraInitializers);
        __esDecorate(null, null, _metaDescription_decorators, { kind: "field", name: "metaDescription", static: false, private: false, access: { has: function (obj) { return "metaDescription" in obj; }, get: function (obj) { return obj.metaDescription; }, set: function (obj, value) { obj.metaDescription = value; } }, metadata: _metadata }, _metaDescription_initializers, _metaDescription_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _parent_decorators, { kind: "field", name: "parent", static: false, private: false, access: { has: function (obj) { return "parent" in obj; }, get: function (obj) { return obj.parent; }, set: function (obj, value) { obj.parent = value; } }, metadata: _metadata }, _parent_initializers, _parent_extraInitializers);
        __esDecorate(null, null, _subcategories_decorators, { kind: "field", name: "subcategories", static: false, private: false, access: { has: function (obj) { return "subcategories" in obj; }, get: function (obj) { return obj.subcategories; }, set: function (obj, value) { obj.subcategories = value; } }, metadata: _metadata }, _subcategories_initializers, _subcategories_extraInitializers);
        __esDecorate(null, null, _businesses_decorators, { kind: "field", name: "businesses", static: false, private: false, access: { has: function (obj) { return "businesses" in obj; }, get: function (obj) { return obj.businesses; }, set: function (obj, value) { obj.businesses = value; } }, metadata: _metadata }, _businesses_initializers, _businesses_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Category = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Category = _classThis;
}();
exports.Category = Category;
