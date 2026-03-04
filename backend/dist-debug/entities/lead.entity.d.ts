import { Listing } from './business.entity';
import { User } from './user.entity';
export declare enum LeadType {
    CALL = "call",
    WHATSAPP = "whatsapp",
    EMAIL = "email",
    CHAT = "chat",
    WEBSITE = "website"
}
export declare enum LeadStatus {
    NEW = "new",
    CONTACTED = "contacted",
    CONVERTED = "converted",
    LOST = "lost"
}
export declare class Lead {
    id: string;
    businessId: string;
    userId: string;
    type: LeadType;
    status: LeadStatus;
    name: string;
    email: string;
    phone: string;
    message: string;
    source: string;
    userAgent: string;
    ipAddress: string;
    referrer: string;
    contactedAt: Date;
    convertedAt: Date;
    notes: string;
    vendorReply: string;
    vendorRepliedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    business: Listing;
    user: User;
}
