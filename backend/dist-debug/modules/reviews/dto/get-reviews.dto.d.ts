import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare class GetReviewsDto extends PaginationDto {
    businessId?: string;
    userId?: string;
    rating?: number;
    vendorId?: string;
}
