import { Listing } from './business.entity';
export declare class Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    iconUrl: string;
    parentId: string;
    displayOrder: number;
    isActive: boolean;
    metaTitle: string;
    metaDescription: string;
    createdAt: Date;
    updatedAt: Date;
    parent: Category;
    subcategories: Category[];
    businesses: Listing[];
}
