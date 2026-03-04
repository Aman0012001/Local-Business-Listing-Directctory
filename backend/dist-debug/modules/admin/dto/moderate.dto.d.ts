import { BusinessStatus } from '../../../entities/business.entity';
export declare enum AdminAction {
    APPROVE = "approve",
    REJECT = "reject",
    SUSPEND = "suspend"
}
export declare class ModerateBusinessDto {
    status: BusinessStatus;
    reason?: string;
}
export declare class ModerateReviewDto {
    isApproved: boolean;
}
