"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBusinessDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_business_dto_1 = require("./create-business.dto");
class UpdateBusinessDto extends (0, swagger_1.PartialType)(create_business_dto_1.CreateBusinessDto) {
}
exports.UpdateBusinessDto = UpdateBusinessDto;
//# sourceMappingURL=update-business.dto.js.map