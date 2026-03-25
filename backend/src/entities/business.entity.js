"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = exports.BusinessStatus = void 0;
var typeorm_1 = require("typeorm");
var class_transformer_1 = require("class-transformer");
var vendor_entity_1 = require("./vendor.entity");
var category_entity_1 = require("./category.entity");
var business_hours_entity_1 = require("./business-hours.entity");
var business_amenity_entity_1 = require("./business-amenity.entity");
var review_entity_1 = require("./review.entity");
var lead_entity_1 = require("./lead.entity");
var favorite_entity_1 = require("./favorite.entity");
var comment_entity_1 = require("./comment.entity");
var follow_entity_1 = require("./follow.entity");
var BusinessStatus;
(function (BusinessStatus) {
    BusinessStatus["PENDING"] = "pending";
    BusinessStatus["APPROVED"] = "approved";
    BusinessStatus["REJECTED"] = "rejected";
    BusinessStatus["SUSPENDED"] = "suspended";
})(BusinessStatus || (exports.BusinessStatus = BusinessStatus = {}));
var Listing = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('businesses'), (0, typeorm_1.Index)(['latitude', 'longitude'])];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _vendorId_decorators;
    var _vendorId_initializers = [];
    var _vendorId_extraInitializers = [];
    var _categoryId_decorators;
    var _categoryId_initializers = [];
    var _categoryId_extraInitializers = [];
    var _suggestedCategoryName_decorators;
    var _suggestedCategoryName_initializers = [];
    var _suggestedCategoryName_extraInitializers = [];
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _get_name_decorators;
    var _get_businessName_decorators;
    var _slug_decorators;
    var _slug_initializers = [];
    var _slug_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _shortDescription_decorators;
    var _shortDescription_initializers = [];
    var _shortDescription_extraInitializers = [];
    var _email_decorators;
    var _email_initializers = [];
    var _email_extraInitializers = [];
    var _phone_decorators;
    var _phone_initializers = [];
    var _phone_extraInitializers = [];
    var _whatsapp_decorators;
    var _whatsapp_initializers = [];
    var _whatsapp_extraInitializers = [];
    var _website_decorators;
    var _website_initializers = [];
    var _website_extraInitializers = [];
    var _address_decorators;
    var _address_initializers = [];
    var _address_extraInitializers = [];
    var _city_decorators;
    var _city_initializers = [];
    var _city_extraInitializers = [];
    var _state_decorators;
    var _state_initializers = [];
    var _state_extraInitializers = [];
    var _country_decorators;
    var _country_initializers = [];
    var _country_extraInitializers = [];
    var _pincode_decorators;
    var _pincode_initializers = [];
    var _pincode_extraInitializers = [];
    var _latitude_decorators;
    var _latitude_initializers = [];
    var _latitude_extraInitializers = [];
    var _longitude_decorators;
    var _longitude_initializers = [];
    var _longitude_extraInitializers = [];
    var _logoUrl_decorators;
    var _logoUrl_initializers = [];
    var _logoUrl_extraInitializers = [];
    var _coverImageUrl_decorators;
    var _coverImageUrl_initializers = [];
    var _coverImageUrl_extraInitializers = [];
    var _images_decorators;
    var _images_initializers = [];
    var _images_extraInitializers = [];
    var _videos_decorators;
    var _videos_initializers = [];
    var _videos_extraInitializers = [];
    var _yearEstablished_decorators;
    var _yearEstablished_initializers = [];
    var _yearEstablished_extraInitializers = [];
    var _employeeCount_decorators;
    var _employeeCount_initializers = [];
    var _employeeCount_extraInitializers = [];
    var _priceRange_decorators;
    var _priceRange_initializers = [];
    var _priceRange_extraInitializers = [];
    var _status_decorators;
    var _status_initializers = [];
    var _status_extraInitializers = [];
    var _isVerified_decorators;
    var _isVerified_initializers = [];
    var _isVerified_extraInitializers = [];
    var _isFeatured_decorators;
    var _isFeatured_initializers = [];
    var _isFeatured_extraInitializers = [];
    var _isSponsored_decorators;
    var _isSponsored_initializers = [];
    var _isSponsored_extraInitializers = [];
    var _averageRating_decorators;
    var _averageRating_initializers = [];
    var _averageRating_extraInitializers = [];
    var _totalReviews_decorators;
    var _totalReviews_initializers = [];
    var _totalReviews_extraInitializers = [];
    var _totalViews_decorators;
    var _totalViews_initializers = [];
    var _totalViews_extraInitializers = [];
    var _totalLeads_decorators;
    var _totalLeads_initializers = [];
    var _totalLeads_extraInitializers = [];
    var _followersCount_decorators;
    var _followersCount_initializers = [];
    var _followersCount_extraInitializers = [];
    var _metaTitle_decorators;
    var _metaTitle_initializers = [];
    var _metaTitle_extraInitializers = [];
    var _metaDescription_decorators;
    var _metaDescription_initializers = [];
    var _metaDescription_extraInitializers = [];
    var _metaKeywords_decorators;
    var _metaKeywords_initializers = [];
    var _metaKeywords_extraInitializers = [];
    var _searchKeywords_decorators;
    var _searchKeywords_initializers = [];
    var _searchKeywords_extraInitializers = [];
    var _approvedAt_decorators;
    var _approvedAt_initializers = [];
    var _approvedAt_extraInitializers = [];
    var _rejectedAt_decorators;
    var _rejectedAt_initializers = [];
    var _rejectedAt_extraInitializers = [];
    var _rejectionReason_decorators;
    var _rejectionReason_initializers = [];
    var _rejectionReason_extraInitializers = [];
    var _hasOffer_decorators;
    var _hasOffer_initializers = [];
    var _hasOffer_extraInitializers = [];
    var _offerTitle_decorators;
    var _offerTitle_initializers = [];
    var _offerTitle_extraInitializers = [];
    var _offerDescription_decorators;
    var _offerDescription_initializers = [];
    var _offerDescription_extraInitializers = [];
    var _offerBadge_decorators;
    var _offerBadge_initializers = [];
    var _offerBadge_extraInitializers = [];
    var _offerExpiresAt_decorators;
    var _offerExpiresAt_initializers = [];
    var _offerExpiresAt_extraInitializers = [];
    var _offerBannerUrl_decorators;
    var _offerBannerUrl_initializers = [];
    var _offerBannerUrl_extraInitializers = [];
    var _faqs_decorators;
    var _faqs_initializers = [];
    var _faqs_extraInitializers = [];
    var _createdAt_decorators;
    var _createdAt_initializers = [];
    var _createdAt_extraInitializers = [];
    var _updatedAt_decorators;
    var _updatedAt_initializers = [];
    var _updatedAt_extraInitializers = [];
    var _vendor_decorators;
    var _vendor_initializers = [];
    var _vendor_extraInitializers = [];
    var _category_decorators;
    var _category_initializers = [];
    var _category_extraInitializers = [];
    var _businessHours_decorators;
    var _businessHours_initializers = [];
    var _businessHours_extraInitializers = [];
    var _businessAmenities_decorators;
    var _businessAmenities_initializers = [];
    var _businessAmenities_extraInitializers = [];
    var _reviews_decorators;
    var _reviews_initializers = [];
    var _reviews_extraInitializers = [];
    var _leads_decorators;
    var _leads_initializers = [];
    var _leads_extraInitializers = [];
    var _savedListings_decorators;
    var _savedListings_initializers = [];
    var _savedListings_extraInitializers = [];
    var _comments_decorators;
    var _comments_initializers = [];
    var _comments_extraInitializers = [];
    var _follows_decorators;
    var _follows_initializers = [];
    var _follows_extraInitializers = [];
    var Listing = _classThis = /** @class */ (function () {
        function Listing_1() {
            this.id = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _id_initializers, void 0));
            this.vendorId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _vendorId_initializers, void 0));
            this.categoryId = (__runInitializers(this, _vendorId_extraInitializers), __runInitializers(this, _categoryId_initializers, void 0));
            this.suggestedCategoryName = (__runInitializers(this, _categoryId_extraInitializers), __runInitializers(this, _suggestedCategoryName_initializers, void 0));
            // Basic Info
            this.title = (__runInitializers(this, _suggestedCategoryName_extraInitializers), __runInitializers(this, _title_initializers, void 0));
            this.slug = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _slug_initializers, void 0));
            this.description = (__runInitializers(this, _slug_extraInitializers), __runInitializers(this, _description_initializers, void 0));
            this.shortDescription = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _shortDescription_initializers, void 0));
            // Contact
            this.email = (__runInitializers(this, _shortDescription_extraInitializers), __runInitializers(this, _email_initializers, void 0));
            this.phone = (__runInitializers(this, _email_extraInitializers), __runInitializers(this, _phone_initializers, void 0));
            this.whatsapp = (__runInitializers(this, _phone_extraInitializers), __runInitializers(this, _whatsapp_initializers, void 0));
            this.website = (__runInitializers(this, _whatsapp_extraInitializers), __runInitializers(this, _website_initializers, void 0));
            // Location
            this.address = (__runInitializers(this, _website_extraInitializers), __runInitializers(this, _address_initializers, void 0));
            this.city = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _city_initializers, void 0));
            this.state = (__runInitializers(this, _city_extraInitializers), __runInitializers(this, _state_initializers, void 0));
            this.country = (__runInitializers(this, _state_extraInitializers), __runInitializers(this, _country_initializers, void 0));
            this.pincode = (__runInitializers(this, _country_extraInitializers), __runInitializers(this, _pincode_initializers, void 0));
            this.latitude = (__runInitializers(this, _pincode_extraInitializers), __runInitializers(this, _latitude_initializers, void 0));
            this.longitude = (__runInitializers(this, _latitude_extraInitializers), __runInitializers(this, _longitude_initializers, void 0));
            /*
            @Column({
                type: 'geography',
                spatialFeatureType: 'Point',
                srid: 4326,
                nullable: true,
            })
            @Index({ spatial: true })
            location: string;
            */
            // Media
            this.logoUrl = (__runInitializers(this, _longitude_extraInitializers), __runInitializers(this, _logoUrl_initializers, void 0));
            this.coverImageUrl = (__runInitializers(this, _logoUrl_extraInitializers), __runInitializers(this, _coverImageUrl_initializers, void 0));
            this.images = (__runInitializers(this, _coverImageUrl_extraInitializers), __runInitializers(this, _images_initializers, void 0));
            this.videos = (__runInitializers(this, _images_extraInitializers), __runInitializers(this, _videos_initializers, void 0));
            // Business Details
            this.yearEstablished = (__runInitializers(this, _videos_extraInitializers), __runInitializers(this, _yearEstablished_initializers, void 0));
            this.employeeCount = (__runInitializers(this, _yearEstablished_extraInitializers), __runInitializers(this, _employeeCount_initializers, void 0));
            this.priceRange = (__runInitializers(this, _employeeCount_extraInitializers), __runInitializers(this, _priceRange_initializers, void 0));
            // Status & Ratings
            this.status = (__runInitializers(this, _priceRange_extraInitializers), __runInitializers(this, _status_initializers, void 0));
            this.isVerified = (__runInitializers(this, _status_extraInitializers), __runInitializers(this, _isVerified_initializers, void 0));
            this.isFeatured = (__runInitializers(this, _isVerified_extraInitializers), __runInitializers(this, _isFeatured_initializers, void 0));
            this.isSponsored = (__runInitializers(this, _isFeatured_extraInitializers), __runInitializers(this, _isSponsored_initializers, void 0));
            this.averageRating = (__runInitializers(this, _isSponsored_extraInitializers), __runInitializers(this, _averageRating_initializers, void 0));
            this.totalReviews = (__runInitializers(this, _averageRating_extraInitializers), __runInitializers(this, _totalReviews_initializers, void 0));
            this.totalViews = (__runInitializers(this, _totalReviews_extraInitializers), __runInitializers(this, _totalViews_initializers, void 0));
            this.totalLeads = (__runInitializers(this, _totalViews_extraInitializers), __runInitializers(this, _totalLeads_initializers, void 0));
            this.followersCount = (__runInitializers(this, _totalLeads_extraInitializers), __runInitializers(this, _followersCount_initializers, void 0));
            // SEO
            this.metaTitle = (__runInitializers(this, _followersCount_extraInitializers), __runInitializers(this, _metaTitle_initializers, void 0));
            this.metaDescription = (__runInitializers(this, _metaTitle_extraInitializers), __runInitializers(this, _metaDescription_initializers, void 0));
            this.metaKeywords = (__runInitializers(this, _metaDescription_extraInitializers), __runInitializers(this, _metaKeywords_initializers, void 0));
            this.searchKeywords = (__runInitializers(this, _metaKeywords_extraInitializers), __runInitializers(this, _searchKeywords_initializers, void 0));
            // Approval
            this.approvedAt = (__runInitializers(this, _searchKeywords_extraInitializers), __runInitializers(this, _approvedAt_initializers, void 0));
            this.rejectedAt = (__runInitializers(this, _approvedAt_extraInitializers), __runInitializers(this, _rejectedAt_initializers, void 0));
            this.rejectionReason = (__runInitializers(this, _rejectedAt_extraInitializers), __runInitializers(this, _rejectionReason_initializers, void 0));
            // Offer / Promo
            this.hasOffer = (__runInitializers(this, _rejectionReason_extraInitializers), __runInitializers(this, _hasOffer_initializers, void 0));
            this.offerTitle = (__runInitializers(this, _hasOffer_extraInitializers), __runInitializers(this, _offerTitle_initializers, void 0));
            this.offerDescription = (__runInitializers(this, _offerTitle_extraInitializers), __runInitializers(this, _offerDescription_initializers, void 0));
            this.offerBadge = (__runInitializers(this, _offerDescription_extraInitializers), __runInitializers(this, _offerBadge_initializers, void 0));
            this.offerExpiresAt = (__runInitializers(this, _offerBadge_extraInitializers), __runInitializers(this, _offerExpiresAt_initializers, void 0));
            this.offerBannerUrl = (__runInitializers(this, _offerExpiresAt_extraInitializers), __runInitializers(this, _offerBannerUrl_initializers, void 0));
            this.faqs = (__runInitializers(this, _offerBannerUrl_extraInitializers), __runInitializers(this, _faqs_initializers, void 0));
            this.createdAt = (__runInitializers(this, _faqs_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
            this.updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
            // Relations
            this.vendor = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _vendor_initializers, void 0));
            this.category = (__runInitializers(this, _vendor_extraInitializers), __runInitializers(this, _category_initializers, void 0));
            this.businessHours = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _businessHours_initializers, void 0));
            this.businessAmenities = (__runInitializers(this, _businessHours_extraInitializers), __runInitializers(this, _businessAmenities_initializers, void 0));
            this.reviews = (__runInitializers(this, _businessAmenities_extraInitializers), __runInitializers(this, _reviews_initializers, void 0));
            this.leads = (__runInitializers(this, _reviews_extraInitializers), __runInitializers(this, _leads_initializers, void 0));
            this.savedListings = (__runInitializers(this, _leads_extraInitializers), __runInitializers(this, _savedListings_initializers, void 0));
            this.comments = (__runInitializers(this, _savedListings_extraInitializers), __runInitializers(this, _comments_initializers, void 0));
            this.follows = (__runInitializers(this, _comments_extraInitializers), __runInitializers(this, _follows_initializers, void 0));
            __runInitializers(this, _follows_extraInitializers);
        }
        Object.defineProperty(Listing_1.prototype, "name", {
            get: function () {
                return this.title;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Listing_1.prototype, "businessName", {
            get: function () {
                return this.title;
            },
            enumerable: false,
            configurable: true
        });
        return Listing_1;
    }());
    __setFunctionName(_classThis, "Listing");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)('uuid')];
        _vendorId_decorators = [(0, typeorm_1.Column)({ name: 'vendor_id', type: 'uuid' })];
        _categoryId_decorators = [(0, typeorm_1.Column)({ name: 'category_id', type: 'uuid', nullable: true }), (0, typeorm_1.Index)()];
        _suggestedCategoryName_decorators = [(0, typeorm_1.Column)({ name: 'suggested_category_name', nullable: true, type: 'text' })];
        _title_decorators = [(0, typeorm_1.Column)({ name: 'name' }), (0, typeorm_1.Index)()];
        _get_name_decorators = [(0, class_transformer_1.Expose)()];
        _get_businessName_decorators = [(0, class_transformer_1.Expose)()];
        _slug_decorators = [(0, typeorm_1.Column)({ unique: true }), (0, typeorm_1.Index)()];
        _description_decorators = [(0, typeorm_1.Column)({ nullable: true, type: 'text' })];
        _shortDescription_decorators = [(0, typeorm_1.Column)({ name: 'short_description', nullable: true, length: 500 })];
        _email_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _phone_decorators = [(0, typeorm_1.Column)({ length: 20 })];
        _whatsapp_decorators = [(0, typeorm_1.Column)({ nullable: true, length: 20 })];
        _website_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _address_decorators = [(0, typeorm_1.Column)({ type: 'text' })];
        _city_decorators = [(0, typeorm_1.Column)({ length: 100, nullable: true }), (0, typeorm_1.Index)()];
        _state_decorators = [(0, typeorm_1.Column)({ length: 100, nullable: true })];
        _country_decorators = [(0, typeorm_1.Column)({ length: 100, default: 'Pakistan', nullable: true })];
        _pincode_decorators = [(0, typeorm_1.Column)({ length: 10, nullable: true }), (0, typeorm_1.Index)()];
        _latitude_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true })];
        _longitude_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true })];
        _logoUrl_decorators = [(0, typeorm_1.Column)({ name: 'logo_url', nullable: true, type: 'text' })];
        _coverImageUrl_decorators = [(0, typeorm_1.Column)({ name: 'cover_image_url', nullable: true, type: 'text' })];
        _images_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: '[]' })];
        _videos_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: '[]' })];
        _yearEstablished_decorators = [(0, typeorm_1.Column)({ name: 'year_established', nullable: true })];
        _employeeCount_decorators = [(0, typeorm_1.Column)({ name: 'employee_count', nullable: true, length: 50 })];
        _priceRange_decorators = [(0, typeorm_1.Column)({ name: 'price_range', nullable: true, length: 10 })];
        _status_decorators = [(0, typeorm_1.Column)({
                type: 'enum',
                enum: BusinessStatus,
                default: BusinessStatus.PENDING,
            }), (0, typeorm_1.Index)()];
        _isVerified_decorators = [(0, typeorm_1.Column)({ name: 'is_verified', default: false })];
        _isFeatured_decorators = [(0, typeorm_1.Column)({ name: 'is_featured', default: false }), (0, typeorm_1.Index)()];
        _isSponsored_decorators = [(0, typeorm_1.Column)({ name: 'is_sponsored', default: false }), (0, typeorm_1.Index)()];
        _averageRating_decorators = [(0, typeorm_1.Column)({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 }), (0, typeorm_1.Index)()];
        _totalReviews_decorators = [(0, typeorm_1.Column)({ name: 'total_reviews', default: 0 })];
        _totalViews_decorators = [(0, typeorm_1.Column)({ name: 'total_views', default: 0 })];
        _totalLeads_decorators = [(0, typeorm_1.Column)({ name: 'total_leads', default: 0 })];
        _followersCount_decorators = [(0, typeorm_1.Column)({ name: 'followers_count', default: 0 })];
        _metaTitle_decorators = [(0, typeorm_1.Column)({ name: 'meta_title', nullable: true })];
        _metaDescription_decorators = [(0, typeorm_1.Column)({ name: 'meta_description', nullable: true, type: 'text' })];
        _metaKeywords_decorators = [(0, typeorm_1.Column)({ name: 'meta_keywords', nullable: true, type: 'text' })];
        _searchKeywords_decorators = [(0, typeorm_1.Column)({ name: 'search_keywords', type: 'jsonb', default: '[]' })];
        _approvedAt_decorators = [(0, typeorm_1.Column)({ name: 'approved_at', nullable: true, type: 'timestamp' })];
        _rejectedAt_decorators = [(0, typeorm_1.Column)({ name: 'rejected_at', nullable: true, type: 'timestamp' })];
        _rejectionReason_decorators = [(0, typeorm_1.Column)({ name: 'rejection_reason', nullable: true, type: 'text' })];
        _hasOffer_decorators = [(0, typeorm_1.Column)({ name: 'has_offer', default: false })];
        _offerTitle_decorators = [(0, typeorm_1.Column)({ name: 'offer_title', nullable: true, length: 150 })];
        _offerDescription_decorators = [(0, typeorm_1.Column)({ name: 'offer_description', nullable: true, type: 'text' })];
        _offerBadge_decorators = [(0, typeorm_1.Column)({ name: 'offer_badge', nullable: true, length: 60 })];
        _offerExpiresAt_decorators = [(0, typeorm_1.Column)({ name: 'offer_expires_at', nullable: true, type: 'timestamp' })];
        _offerBannerUrl_decorators = [(0, typeorm_1.Column)({ name: 'offer_banner_url', nullable: true, type: 'text' })];
        _faqs_decorators = [(0, typeorm_1.Column)({ type: 'jsonb', default: '[]' })];
        _createdAt_decorators = [(0, typeorm_1.CreateDateColumn)({ name: 'created_at' })];
        _updatedAt_decorators = [(0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' })];
        _vendor_decorators = [(0, typeorm_1.ManyToOne)(function () { return vendor_entity_1.Vendor; }, function (vendor) { return vendor.businesses; }), (0, typeorm_1.JoinColumn)({ name: 'vendor_id' })];
        _category_decorators = [(0, typeorm_1.ManyToOne)(function () { return category_entity_1.Category; }, function (category) { return category.businesses; }), (0, typeorm_1.JoinColumn)({ name: 'category_id' })];
        _businessHours_decorators = [(0, typeorm_1.OneToMany)(function () { return business_hours_entity_1.BusinessHours; }, function (hours) { return hours.business; })];
        _businessAmenities_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToMany)(function () { return business_amenity_entity_1.BusinessAmenity; }, function (amenity) { return amenity.business; })];
        _reviews_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToMany)(function () { return review_entity_1.Review; }, function (review) { return review.business; })];
        _leads_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToMany)(function () { return lead_entity_1.Lead; }, function (lead) { return lead.business; })];
        _savedListings_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToMany)(function () { return favorite_entity_1.SavedListing; }, function (savedListing) { return savedListing.business; })];
        _comments_decorators = [(0, class_transformer_1.Exclude)(), (0, typeorm_1.OneToMany)(function () { return comment_entity_1.Comment; }, function (comment) { return comment.business; })];
        _follows_decorators = [(0, typeorm_1.OneToMany)(function () { return follow_entity_1.Follow; }, function (follow) { return follow.business; })];
        __esDecorate(_classThis, null, _get_name_decorators, { kind: "getter", name: "name", static: false, private: false, access: { has: function (obj) { return "name" in obj; }, get: function (obj) { return obj.name; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _get_businessName_decorators, { kind: "getter", name: "businessName", static: false, private: false, access: { has: function (obj) { return "businessName" in obj; }, get: function (obj) { return obj.businessName; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _vendorId_decorators, { kind: "field", name: "vendorId", static: false, private: false, access: { has: function (obj) { return "vendorId" in obj; }, get: function (obj) { return obj.vendorId; }, set: function (obj, value) { obj.vendorId = value; } }, metadata: _metadata }, _vendorId_initializers, _vendorId_extraInitializers);
        __esDecorate(null, null, _categoryId_decorators, { kind: "field", name: "categoryId", static: false, private: false, access: { has: function (obj) { return "categoryId" in obj; }, get: function (obj) { return obj.categoryId; }, set: function (obj, value) { obj.categoryId = value; } }, metadata: _metadata }, _categoryId_initializers, _categoryId_extraInitializers);
        __esDecorate(null, null, _suggestedCategoryName_decorators, { kind: "field", name: "suggestedCategoryName", static: false, private: false, access: { has: function (obj) { return "suggestedCategoryName" in obj; }, get: function (obj) { return obj.suggestedCategoryName; }, set: function (obj, value) { obj.suggestedCategoryName = value; } }, metadata: _metadata }, _suggestedCategoryName_initializers, _suggestedCategoryName_extraInitializers);
        __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
        __esDecorate(null, null, _slug_decorators, { kind: "field", name: "slug", static: false, private: false, access: { has: function (obj) { return "slug" in obj; }, get: function (obj) { return obj.slug; }, set: function (obj, value) { obj.slug = value; } }, metadata: _metadata }, _slug_initializers, _slug_extraInitializers);
        __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
        __esDecorate(null, null, _shortDescription_decorators, { kind: "field", name: "shortDescription", static: false, private: false, access: { has: function (obj) { return "shortDescription" in obj; }, get: function (obj) { return obj.shortDescription; }, set: function (obj, value) { obj.shortDescription = value; } }, metadata: _metadata }, _shortDescription_initializers, _shortDescription_extraInitializers);
        __esDecorate(null, null, _email_decorators, { kind: "field", name: "email", static: false, private: false, access: { has: function (obj) { return "email" in obj; }, get: function (obj) { return obj.email; }, set: function (obj, value) { obj.email = value; } }, metadata: _metadata }, _email_initializers, _email_extraInitializers);
        __esDecorate(null, null, _phone_decorators, { kind: "field", name: "phone", static: false, private: false, access: { has: function (obj) { return "phone" in obj; }, get: function (obj) { return obj.phone; }, set: function (obj, value) { obj.phone = value; } }, metadata: _metadata }, _phone_initializers, _phone_extraInitializers);
        __esDecorate(null, null, _whatsapp_decorators, { kind: "field", name: "whatsapp", static: false, private: false, access: { has: function (obj) { return "whatsapp" in obj; }, get: function (obj) { return obj.whatsapp; }, set: function (obj, value) { obj.whatsapp = value; } }, metadata: _metadata }, _whatsapp_initializers, _whatsapp_extraInitializers);
        __esDecorate(null, null, _website_decorators, { kind: "field", name: "website", static: false, private: false, access: { has: function (obj) { return "website" in obj; }, get: function (obj) { return obj.website; }, set: function (obj, value) { obj.website = value; } }, metadata: _metadata }, _website_initializers, _website_extraInitializers);
        __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: function (obj) { return "address" in obj; }, get: function (obj) { return obj.address; }, set: function (obj, value) { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
        __esDecorate(null, null, _city_decorators, { kind: "field", name: "city", static: false, private: false, access: { has: function (obj) { return "city" in obj; }, get: function (obj) { return obj.city; }, set: function (obj, value) { obj.city = value; } }, metadata: _metadata }, _city_initializers, _city_extraInitializers);
        __esDecorate(null, null, _state_decorators, { kind: "field", name: "state", static: false, private: false, access: { has: function (obj) { return "state" in obj; }, get: function (obj) { return obj.state; }, set: function (obj, value) { obj.state = value; } }, metadata: _metadata }, _state_initializers, _state_extraInitializers);
        __esDecorate(null, null, _country_decorators, { kind: "field", name: "country", static: false, private: false, access: { has: function (obj) { return "country" in obj; }, get: function (obj) { return obj.country; }, set: function (obj, value) { obj.country = value; } }, metadata: _metadata }, _country_initializers, _country_extraInitializers);
        __esDecorate(null, null, _pincode_decorators, { kind: "field", name: "pincode", static: false, private: false, access: { has: function (obj) { return "pincode" in obj; }, get: function (obj) { return obj.pincode; }, set: function (obj, value) { obj.pincode = value; } }, metadata: _metadata }, _pincode_initializers, _pincode_extraInitializers);
        __esDecorate(null, null, _latitude_decorators, { kind: "field", name: "latitude", static: false, private: false, access: { has: function (obj) { return "latitude" in obj; }, get: function (obj) { return obj.latitude; }, set: function (obj, value) { obj.latitude = value; } }, metadata: _metadata }, _latitude_initializers, _latitude_extraInitializers);
        __esDecorate(null, null, _longitude_decorators, { kind: "field", name: "longitude", static: false, private: false, access: { has: function (obj) { return "longitude" in obj; }, get: function (obj) { return obj.longitude; }, set: function (obj, value) { obj.longitude = value; } }, metadata: _metadata }, _longitude_initializers, _longitude_extraInitializers);
        __esDecorate(null, null, _logoUrl_decorators, { kind: "field", name: "logoUrl", static: false, private: false, access: { has: function (obj) { return "logoUrl" in obj; }, get: function (obj) { return obj.logoUrl; }, set: function (obj, value) { obj.logoUrl = value; } }, metadata: _metadata }, _logoUrl_initializers, _logoUrl_extraInitializers);
        __esDecorate(null, null, _coverImageUrl_decorators, { kind: "field", name: "coverImageUrl", static: false, private: false, access: { has: function (obj) { return "coverImageUrl" in obj; }, get: function (obj) { return obj.coverImageUrl; }, set: function (obj, value) { obj.coverImageUrl = value; } }, metadata: _metadata }, _coverImageUrl_initializers, _coverImageUrl_extraInitializers);
        __esDecorate(null, null, _images_decorators, { kind: "field", name: "images", static: false, private: false, access: { has: function (obj) { return "images" in obj; }, get: function (obj) { return obj.images; }, set: function (obj, value) { obj.images = value; } }, metadata: _metadata }, _images_initializers, _images_extraInitializers);
        __esDecorate(null, null, _videos_decorators, { kind: "field", name: "videos", static: false, private: false, access: { has: function (obj) { return "videos" in obj; }, get: function (obj) { return obj.videos; }, set: function (obj, value) { obj.videos = value; } }, metadata: _metadata }, _videos_initializers, _videos_extraInitializers);
        __esDecorate(null, null, _yearEstablished_decorators, { kind: "field", name: "yearEstablished", static: false, private: false, access: { has: function (obj) { return "yearEstablished" in obj; }, get: function (obj) { return obj.yearEstablished; }, set: function (obj, value) { obj.yearEstablished = value; } }, metadata: _metadata }, _yearEstablished_initializers, _yearEstablished_extraInitializers);
        __esDecorate(null, null, _employeeCount_decorators, { kind: "field", name: "employeeCount", static: false, private: false, access: { has: function (obj) { return "employeeCount" in obj; }, get: function (obj) { return obj.employeeCount; }, set: function (obj, value) { obj.employeeCount = value; } }, metadata: _metadata }, _employeeCount_initializers, _employeeCount_extraInitializers);
        __esDecorate(null, null, _priceRange_decorators, { kind: "field", name: "priceRange", static: false, private: false, access: { has: function (obj) { return "priceRange" in obj; }, get: function (obj) { return obj.priceRange; }, set: function (obj, value) { obj.priceRange = value; } }, metadata: _metadata }, _priceRange_initializers, _priceRange_extraInitializers);
        __esDecorate(null, null, _status_decorators, { kind: "field", name: "status", static: false, private: false, access: { has: function (obj) { return "status" in obj; }, get: function (obj) { return obj.status; }, set: function (obj, value) { obj.status = value; } }, metadata: _metadata }, _status_initializers, _status_extraInitializers);
        __esDecorate(null, null, _isVerified_decorators, { kind: "field", name: "isVerified", static: false, private: false, access: { has: function (obj) { return "isVerified" in obj; }, get: function (obj) { return obj.isVerified; }, set: function (obj, value) { obj.isVerified = value; } }, metadata: _metadata }, _isVerified_initializers, _isVerified_extraInitializers);
        __esDecorate(null, null, _isFeatured_decorators, { kind: "field", name: "isFeatured", static: false, private: false, access: { has: function (obj) { return "isFeatured" in obj; }, get: function (obj) { return obj.isFeatured; }, set: function (obj, value) { obj.isFeatured = value; } }, metadata: _metadata }, _isFeatured_initializers, _isFeatured_extraInitializers);
        __esDecorate(null, null, _isSponsored_decorators, { kind: "field", name: "isSponsored", static: false, private: false, access: { has: function (obj) { return "isSponsored" in obj; }, get: function (obj) { return obj.isSponsored; }, set: function (obj, value) { obj.isSponsored = value; } }, metadata: _metadata }, _isSponsored_initializers, _isSponsored_extraInitializers);
        __esDecorate(null, null, _averageRating_decorators, { kind: "field", name: "averageRating", static: false, private: false, access: { has: function (obj) { return "averageRating" in obj; }, get: function (obj) { return obj.averageRating; }, set: function (obj, value) { obj.averageRating = value; } }, metadata: _metadata }, _averageRating_initializers, _averageRating_extraInitializers);
        __esDecorate(null, null, _totalReviews_decorators, { kind: "field", name: "totalReviews", static: false, private: false, access: { has: function (obj) { return "totalReviews" in obj; }, get: function (obj) { return obj.totalReviews; }, set: function (obj, value) { obj.totalReviews = value; } }, metadata: _metadata }, _totalReviews_initializers, _totalReviews_extraInitializers);
        __esDecorate(null, null, _totalViews_decorators, { kind: "field", name: "totalViews", static: false, private: false, access: { has: function (obj) { return "totalViews" in obj; }, get: function (obj) { return obj.totalViews; }, set: function (obj, value) { obj.totalViews = value; } }, metadata: _metadata }, _totalViews_initializers, _totalViews_extraInitializers);
        __esDecorate(null, null, _totalLeads_decorators, { kind: "field", name: "totalLeads", static: false, private: false, access: { has: function (obj) { return "totalLeads" in obj; }, get: function (obj) { return obj.totalLeads; }, set: function (obj, value) { obj.totalLeads = value; } }, metadata: _metadata }, _totalLeads_initializers, _totalLeads_extraInitializers);
        __esDecorate(null, null, _followersCount_decorators, { kind: "field", name: "followersCount", static: false, private: false, access: { has: function (obj) { return "followersCount" in obj; }, get: function (obj) { return obj.followersCount; }, set: function (obj, value) { obj.followersCount = value; } }, metadata: _metadata }, _followersCount_initializers, _followersCount_extraInitializers);
        __esDecorate(null, null, _metaTitle_decorators, { kind: "field", name: "metaTitle", static: false, private: false, access: { has: function (obj) { return "metaTitle" in obj; }, get: function (obj) { return obj.metaTitle; }, set: function (obj, value) { obj.metaTitle = value; } }, metadata: _metadata }, _metaTitle_initializers, _metaTitle_extraInitializers);
        __esDecorate(null, null, _metaDescription_decorators, { kind: "field", name: "metaDescription", static: false, private: false, access: { has: function (obj) { return "metaDescription" in obj; }, get: function (obj) { return obj.metaDescription; }, set: function (obj, value) { obj.metaDescription = value; } }, metadata: _metadata }, _metaDescription_initializers, _metaDescription_extraInitializers);
        __esDecorate(null, null, _metaKeywords_decorators, { kind: "field", name: "metaKeywords", static: false, private: false, access: { has: function (obj) { return "metaKeywords" in obj; }, get: function (obj) { return obj.metaKeywords; }, set: function (obj, value) { obj.metaKeywords = value; } }, metadata: _metadata }, _metaKeywords_initializers, _metaKeywords_extraInitializers);
        __esDecorate(null, null, _searchKeywords_decorators, { kind: "field", name: "searchKeywords", static: false, private: false, access: { has: function (obj) { return "searchKeywords" in obj; }, get: function (obj) { return obj.searchKeywords; }, set: function (obj, value) { obj.searchKeywords = value; } }, metadata: _metadata }, _searchKeywords_initializers, _searchKeywords_extraInitializers);
        __esDecorate(null, null, _approvedAt_decorators, { kind: "field", name: "approvedAt", static: false, private: false, access: { has: function (obj) { return "approvedAt" in obj; }, get: function (obj) { return obj.approvedAt; }, set: function (obj, value) { obj.approvedAt = value; } }, metadata: _metadata }, _approvedAt_initializers, _approvedAt_extraInitializers);
        __esDecorate(null, null, _rejectedAt_decorators, { kind: "field", name: "rejectedAt", static: false, private: false, access: { has: function (obj) { return "rejectedAt" in obj; }, get: function (obj) { return obj.rejectedAt; }, set: function (obj, value) { obj.rejectedAt = value; } }, metadata: _metadata }, _rejectedAt_initializers, _rejectedAt_extraInitializers);
        __esDecorate(null, null, _rejectionReason_decorators, { kind: "field", name: "rejectionReason", static: false, private: false, access: { has: function (obj) { return "rejectionReason" in obj; }, get: function (obj) { return obj.rejectionReason; }, set: function (obj, value) { obj.rejectionReason = value; } }, metadata: _metadata }, _rejectionReason_initializers, _rejectionReason_extraInitializers);
        __esDecorate(null, null, _hasOffer_decorators, { kind: "field", name: "hasOffer", static: false, private: false, access: { has: function (obj) { return "hasOffer" in obj; }, get: function (obj) { return obj.hasOffer; }, set: function (obj, value) { obj.hasOffer = value; } }, metadata: _metadata }, _hasOffer_initializers, _hasOffer_extraInitializers);
        __esDecorate(null, null, _offerTitle_decorators, { kind: "field", name: "offerTitle", static: false, private: false, access: { has: function (obj) { return "offerTitle" in obj; }, get: function (obj) { return obj.offerTitle; }, set: function (obj, value) { obj.offerTitle = value; } }, metadata: _metadata }, _offerTitle_initializers, _offerTitle_extraInitializers);
        __esDecorate(null, null, _offerDescription_decorators, { kind: "field", name: "offerDescription", static: false, private: false, access: { has: function (obj) { return "offerDescription" in obj; }, get: function (obj) { return obj.offerDescription; }, set: function (obj, value) { obj.offerDescription = value; } }, metadata: _metadata }, _offerDescription_initializers, _offerDescription_extraInitializers);
        __esDecorate(null, null, _offerBadge_decorators, { kind: "field", name: "offerBadge", static: false, private: false, access: { has: function (obj) { return "offerBadge" in obj; }, get: function (obj) { return obj.offerBadge; }, set: function (obj, value) { obj.offerBadge = value; } }, metadata: _metadata }, _offerBadge_initializers, _offerBadge_extraInitializers);
        __esDecorate(null, null, _offerExpiresAt_decorators, { kind: "field", name: "offerExpiresAt", static: false, private: false, access: { has: function (obj) { return "offerExpiresAt" in obj; }, get: function (obj) { return obj.offerExpiresAt; }, set: function (obj, value) { obj.offerExpiresAt = value; } }, metadata: _metadata }, _offerExpiresAt_initializers, _offerExpiresAt_extraInitializers);
        __esDecorate(null, null, _offerBannerUrl_decorators, { kind: "field", name: "offerBannerUrl", static: false, private: false, access: { has: function (obj) { return "offerBannerUrl" in obj; }, get: function (obj) { return obj.offerBannerUrl; }, set: function (obj, value) { obj.offerBannerUrl = value; } }, metadata: _metadata }, _offerBannerUrl_initializers, _offerBannerUrl_extraInitializers);
        __esDecorate(null, null, _faqs_decorators, { kind: "field", name: "faqs", static: false, private: false, access: { has: function (obj) { return "faqs" in obj; }, get: function (obj) { return obj.faqs; }, set: function (obj, value) { obj.faqs = value; } }, metadata: _metadata }, _faqs_initializers, _faqs_extraInitializers);
        __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: function (obj) { return "createdAt" in obj; }, get: function (obj) { return obj.createdAt; }, set: function (obj, value) { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
        __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: function (obj) { return "updatedAt" in obj; }, get: function (obj) { return obj.updatedAt; }, set: function (obj, value) { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
        __esDecorate(null, null, _vendor_decorators, { kind: "field", name: "vendor", static: false, private: false, access: { has: function (obj) { return "vendor" in obj; }, get: function (obj) { return obj.vendor; }, set: function (obj, value) { obj.vendor = value; } }, metadata: _metadata }, _vendor_initializers, _vendor_extraInitializers);
        __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: function (obj) { return "category" in obj; }, get: function (obj) { return obj.category; }, set: function (obj, value) { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
        __esDecorate(null, null, _businessHours_decorators, { kind: "field", name: "businessHours", static: false, private: false, access: { has: function (obj) { return "businessHours" in obj; }, get: function (obj) { return obj.businessHours; }, set: function (obj, value) { obj.businessHours = value; } }, metadata: _metadata }, _businessHours_initializers, _businessHours_extraInitializers);
        __esDecorate(null, null, _businessAmenities_decorators, { kind: "field", name: "businessAmenities", static: false, private: false, access: { has: function (obj) { return "businessAmenities" in obj; }, get: function (obj) { return obj.businessAmenities; }, set: function (obj, value) { obj.businessAmenities = value; } }, metadata: _metadata }, _businessAmenities_initializers, _businessAmenities_extraInitializers);
        __esDecorate(null, null, _reviews_decorators, { kind: "field", name: "reviews", static: false, private: false, access: { has: function (obj) { return "reviews" in obj; }, get: function (obj) { return obj.reviews; }, set: function (obj, value) { obj.reviews = value; } }, metadata: _metadata }, _reviews_initializers, _reviews_extraInitializers);
        __esDecorate(null, null, _leads_decorators, { kind: "field", name: "leads", static: false, private: false, access: { has: function (obj) { return "leads" in obj; }, get: function (obj) { return obj.leads; }, set: function (obj, value) { obj.leads = value; } }, metadata: _metadata }, _leads_initializers, _leads_extraInitializers);
        __esDecorate(null, null, _savedListings_decorators, { kind: "field", name: "savedListings", static: false, private: false, access: { has: function (obj) { return "savedListings" in obj; }, get: function (obj) { return obj.savedListings; }, set: function (obj, value) { obj.savedListings = value; } }, metadata: _metadata }, _savedListings_initializers, _savedListings_extraInitializers);
        __esDecorate(null, null, _comments_decorators, { kind: "field", name: "comments", static: false, private: false, access: { has: function (obj) { return "comments" in obj; }, get: function (obj) { return obj.comments; }, set: function (obj, value) { obj.comments = value; } }, metadata: _metadata }, _comments_initializers, _comments_extraInitializers);
        __esDecorate(null, null, _follows_decorators, { kind: "field", name: "follows", static: false, private: false, access: { has: function (obj) { return "follows" in obj; }, get: function (obj) { return obj.follows; }, set: function (obj, value) { obj.follows = value; } }, metadata: _metadata }, _follows_initializers, _follows_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Listing = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Listing = _classThis;
}();
exports.Listing = Listing;
