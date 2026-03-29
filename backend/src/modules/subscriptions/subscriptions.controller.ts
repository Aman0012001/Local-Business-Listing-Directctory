import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    UseGuards,
    Param,
    Query,
    Req,
    Headers,
    RawBodyRequest,
    BadRequestException
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { CreatePlanDto, UpdatePlanDto, CheckoutDto, AssignPlanDto, ChangePlanDto } from './dto/subscription.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User, UserRole } from '../../entities/user.entity';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class SubscriptionsController {
    constructor(
        private readonly subService: SubscriptionsService,
        private readonly cronService: SubscriptionCronService,
    ) { }

    // ─── Public / Plans ────────────────────────────────────────────────────────

    @Public()
    @Get('plans')
    @ApiOperation({ summary: 'List all active subscription plans' })
    getPlans() {
        return this.subService.getPlans();
    }

    @Get('plans/admin')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'List all plans including inactive (Admin only)' })
    getPlansForAdmin() {
        return this.subService.getPlansForAdmin();
    }

    @Get('plans/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get plan details by ID (Admin only)' })
    getPlanById(@Param('id') id: string) {
        return this.subService.getPlanById(id);
    }

    @Post('plans')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new plan (Admin only)' })
    createPlan(@Body() createPlanDto: CreatePlanDto) {
        return this.subService.createPlan(createPlanDto);
    }

    @Patch('plans/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update a plan (Admin only)' })
    updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
        return this.subService.updatePlan(id, updatePlanDto);
    }

    @Delete('plans/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete a plan (Admin only)' })
    deletePlan(@Param('id') id: string) {
        return this.subService.deletePlan(id);
    }

    // ─── Admin Subscription Management ─────────────────────────────────────────

    @Get('admin/all')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get all vendor subscriptions (Admin only)' })
    getAllSubscriptions(@Query('page') page = '1', @Query('limit') limit = '20') {
        return this.subService.getAllSubscriptionsForAdmin(+page, +limit);
    }

    @Get('admin/transactions')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get all transactions (Admin only)' })
    getAllTransactions(@Query('page') page = '1', @Query('limit') limit = '20') {
        return this.subService.getAllTransactionsForAdmin(+page, +limit);
    }

    @Post('admin/assign')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Admin assigns a plan to a vendor' })
    @ApiResponse({ status: 201, description: 'Plan assigned successfully' })
    assignPlan(@Body() dto: AssignPlanDto) {
        return this.subService.assignPlanToVendor(dto);
    }

    @Patch('admin/:subId/cancel')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Admin cancels a subscription' })
    cancelSubscription(@Param('subId') subId: string) {
        return this.subService.cancelSubscriptionAdmin(subId);
    }

    @Post('admin/trigger-expiry-check')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Manually trigger the expiry reminder cron (Admin only)' })
    async triggerExpiryCheck() {
        const result = await this.cronService.sendExpiryReminders();
        return { message: 'Expiry check complete', ...result };
    }

    // ─── Vendor Endpoints ───────────────────────────────────────────────────────

    @Post('checkout')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Initiate a checkout session' })
    createCheckout(@CurrentUser() user: User, @Body() checkoutDto: CheckoutDto) {
        return this.subService.createCheckoutSession(user.id, checkoutDto);
    }

    @Get('active')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get current active subscription for logged-in vendor' })
    getActive(@CurrentUser() user: User) {
        return this.subService.getActiveSubscription(user.id);
    }

    @Post('verify')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Manually verify a payment session if webhook failed' })
    verifyPayment(@CurrentUser() user: User, @Body('sessionId') sessionId: string) {
        if (!sessionId) throw new BadRequestException('sessionId is required');
        return this.subService.verifyCheckoutSession(sessionId, user.id);
    }

    @Get('my-invoices')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get all invoices/transactions for the logged-in vendor' })
    getMyInvoices(@CurrentUser() user: User) {
        return this.subService.getTransactions(user.id);
    }

    @Get('invoice/:id')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get a single invoice detail for the logged-in vendor' })
    getInvoice(@Param('id') id: string, @CurrentUser() user: User) {
        return this.subService.getInvoiceDetail(id, user.id);
    }

    @Post('change')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Upgrade or downgrade subscription plan' })
    async changePlan(
        @CurrentUser() user: User,
        @Body() dto: ChangePlanDto
    ) {
        return this.subService.changeSubscription(user.id, dto.planId);
    }

    @Post('mock-success/:planId')

    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Mock a payment success for development' })
    async mockSuccess(
        @CurrentUser() user: User,
        @Param('planId') planId: string
    ) {
        // Look up current vendor via active subscription or by querying vendors
        const sub = await this.subService.getActiveSubscription(user.id).catch(() => null);
        const vendorId = (sub as any)?.vendorId;
        // If no active sub, we rely on the service to find vendor by userId
        return this.subService.handleMockSubscriptionSuccess(
            vendorId || user.id, // fallback: service will handle by userId lookup
            planId,
            'MOCK-SUB-' + Date.now()
        );
    }

    // --- Webhook ---
    @Public()
    @Post('webhook')
    @ApiOperation({ summary: 'Stripe Webhook' })
    async stripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
    ) {
        if (!signature || !req.rawBody) {
            throw new BadRequestException('Missing stripe signature or raw body');
        }
        return this.subService.handleStripeWebhook(signature, req.rawBody);
    }

    // Keep old endpoint for backward compat
    @Get('transactions')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Get transaction history (deprecated, use /my-invoices)' })
    getTransactions(@CurrentUser() user: User) {
        return this.subService.getTransactions(user.id);
    }
}
