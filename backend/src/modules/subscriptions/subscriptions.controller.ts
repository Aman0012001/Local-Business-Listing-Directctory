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
import { PricingPlanType } from '../../entities/pricing-plan.entity';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionCronService } from './subscription-cron.service';
import { CreatePlanDto, UpdatePlanDto, CheckoutDto, AssignPlanDto, ChangePlanDto, CreateOfferPlanDto, UpdateOfferPlanDto } from './dto/subscription.dto';
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

    @Public()
    @Get('pricing/plans')
    @ApiOperation({ summary: 'List all active monetization plans (New System)' })
    getPricingPlans(@Query('type') type?: PricingPlanType) {
        return this.subService.getPricingPlans(type);
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

    @Post('pricing/checkout')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Initiate a checkout session for a PricingPlan' })
    createPricingCheckout(@CurrentUser() user: User, @Body() checkoutDto: CheckoutDto) {
        return this.subService.createPricingCheckoutSession(user.id, checkoutDto.planId, checkoutDto.targetId);
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
        @Param('planId') planId: string,
        @Query('system') system: 'old' | 'new' = 'new',
        @Query('targetId') targetId?: string
    ) {
        if (system === 'new') {
            const vendor = await (this.subService as any).vendorRepository.findOne({ where: { userId: user.id } });
            return this.subService.processActivePlanSuccess(
                vendor.id,
                planId,
                'MOCK-NEW-' + Date.now(),
                'Mock',
                targetId
            );
        }
        
        // Old system fallback
        const sub = await this.subService.getActiveSubscription(user.id).catch(() => null);
        const vendorId = (sub as any)?.vendorId;
        return this.subService.handleMockSubscriptionSuccess(
            vendorId || user.id,
            planId,
            'MOCK-SUB-' + Date.now()
        );
    }

    /**
     * Create a Stripe Checkout session for an Offer/Event pricing plan.
     * Returns { checkoutUrl } — frontend redirects to Stripe.
     */
    @Post('offer-plan-checkout/:planId')
    @Roles(UserRole.VENDOR, UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create Stripe checkout for an offer/event pricing plan' })
    async offerPlanCheckout(
        @CurrentUser() user: User,
        @Param('planId') planId: string,
    ) {
        return this.subService.createOfferPlanCheckoutSession(user.id, planId);
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

    // ─── Offer & Event Pricing Plan Endpoints ──────────────────────────────────

    @Public()
    @Get('offer-plans')
    @ApiOperation({ summary: 'List active offer/event pricing plans (public)' })
    getOfferPlans(@Query('type') type?: 'offer' | 'event') {
        return this.subService.getOfferPlans(type);
    }

    @Get('offer-plans/admin')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'List all offer/event pricing plans including inactive (admin)' })
    getOfferPlansAdmin(@Query('type') type?: 'offer' | 'event') {
        return this.subService.getOfferPlansAdmin(type);
    }

    @Post('offer-plans')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Create a new offer/event pricing plan (admin)' })
    createOfferPlan(@Body() dto: CreateOfferPlanDto) {
        return this.subService.createOfferPlan(dto);
    }

    @Patch('offer-plans/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Update an offer/event pricing plan (admin)' })
    updateOfferPlan(@Param('id') id: string, @Body() dto: UpdateOfferPlanDto) {
        return this.subService.updateOfferPlan(id, dto);
    }

    @Delete('offer-plans/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiOperation({ summary: 'Delete an offer/event pricing plan (admin)' })
    deleteOfferPlan(@Param('id') id: string) {
        return this.subService.deleteOfferPlan(id);
    }
}
