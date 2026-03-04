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
exports.CitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const city_entity_1 = require("../../entities/city.entity");
let CitiesService = class CitiesService {
    constructor(cityRepository) {
        this.cityRepository = cityRepository;
    }
    async findAll() {
        return this.cityRepository.find({
            order: { displayOrder: 'ASC', name: 'ASC' },
        });
    }
    async findPopular() {
        return this.cityRepository.find({
            where: { isPopular: true },
            order: { displayOrder: 'ASC' },
        });
    }
    async findBySlug(slug) {
        const city = await this.cityRepository.findOne({
            where: { slug },
        });
        if (!city) {
            throw new common_1.NotFoundException(`City with slug ${slug} not found`);
        }
        return city;
    }
};
exports.CitiesService = CitiesService;
exports.CitiesService = CitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(city_entity_1.City)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CitiesService);
//# sourceMappingURL=cities.service.js.map