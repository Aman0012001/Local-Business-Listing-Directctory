import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_FEATURE_KEY } from '../decorators/check-feature.decorator';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';
import { UserRole } from '../../entities/user.entity';

@Injectable()
export class FeatureGateGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private subscriptionsService: SubscriptionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredFeature = this.reflector.get<string>(
            CHECK_FEATURE_KEY,
            context.getHandler(),
        );

        if (!requiredFeature) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            return false;
        }

        // Admins and Superadmins bypass feature gates
        if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) {
            return true;
        }

        if (user.role !== UserRole.VENDOR) {
            throw new ForbiddenException('Only vendors are subject to feature limits');
        }

        // Check if the vendor can perform the action (supports numeric limits and boolean features)
        const canPerform = await this.subscriptionsService.canPerformAction(user.id, requiredFeature);
        
        if (canPerform) {
            return true;
        }

        throw new ForbiddenException(`Your current plan does not include the "${requiredFeature}" feature or you have reached your limit. Please upgrade.`);
    }
}
