import { PaginationDto } from '../../../common/dto/pagination.dto';
export declare enum SearchSortBy {
    RELEVANCE = "relevance",
    DISTANCE = "distance",
    RATING = "rating",
    NEWEST = "newest"
}
export declare class SearchBusinessDto extends PaginationDto {
    query?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    categoryId?: string;
    city?: string;
    categorySlug?: string;
    minRating?: number;
    priceRange?: string;
    openNow?: boolean;
    featuredOnly?: boolean;
    verifiedOnly?: boolean;
    sortBy?: SearchSortBy;
}
