import { Listing } from './business.entity';
export declare enum DayOfWeek {
    MONDAY = "monday",
    TUESDAY = "tuesday",
    WEDNESDAY = "wednesday",
    THURSDAY = "thursday",
    FRIDAY = "friday",
    SATURDAY = "saturday",
    SUNDAY = "sunday"
}
export declare class BusinessHours {
    id: string;
    businessId: string;
    dayOfWeek: DayOfWeek;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    createdAt: Date;
    business: Listing;
}
