import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto, CheckoutDto } from './dto/subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
    constructor(private readonly subService: SubscriptionsService) { }

    @Public()
    @Get('plans')
    @ApiOperation({ summary: 'List all active subscription plans' })
    @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
    getPlans() {
        return this.subService.getPlans();
    }

    @Post('plans')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Create a new plan (Admin only)' })
    @ApiResponse({ status: 201, description: 'Plan created' })
    createPlan(@Body() createPlanDto: CreatePlanDto) {
        return this.subService.createPlan(createPlanDto);
    }

    @Post('checkout')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Initiate a checkout session' })
    @ApiResponse({ status: 201, description: 'Checkout session created' })
    createCheckout(@CurrentUser() user: User, @Body() checkoutDto: CheckoutDto) {
        return this.subService.createCheckoutSession(user.id, checkoutDto);
    }

    @Get('active')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get current active subscription' })
    @ApiResponse({ status: 200, description: 'Active subscription retrieved' })
    getActive(@CurrentUser() user: User) {
        return this.subService.getActiveSubscription(user.id);
    }

    @Get('transactions')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Get transaction history' })
    @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
    getTransactions(@CurrentUser() user: User) {
        return this.subService.getTransactions(user.id);
    }

    @Post('mock-success/:planId')
    @Roles(UserRole.VENDOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Mock a payment success for development' })
    @ApiResponse({ status: 201, description: 'Subscribed successfully' })
    async mockSuccess(
        @CurrentUser() user: User,
        @Param('planId') planId: string
    ) {
        const sub = await this.subService.getActiveSubscription(user.id);
        // This is just for development testing
        return this.subService.handleStripeSubscriptionSuccess(
            user.vendor.id,
            planId,
            'MOCK-STRIPE-SUB-' + Date.now()
        );
    }
}
