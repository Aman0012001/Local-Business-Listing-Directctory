"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_service_1 = require("./search.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const user_entity_1 = require("../../entities/user.entity");
let SearchController = class SearchController {
    constructor(searchService) {
        this.searchService = searchService;
    }
    async search(query, city, category) {
        return this.searchService.search(query, city, category);
    }
    async sync() {
        return this.searchService.reindexAll();
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search businesses using Elasticsearch' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Search results returned' }),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('city')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Post)('sync'),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Re-index all businesses (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Sync completed' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "sync", null);
exports.SearchController = SearchController = __decorate([
    (0, swagger_1.ApiTags)('search'),
    (0, common_1.Controller)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [search_service_1.SearchService])
], SearchController);
//# sourceMappingURL=search.controller.js.map