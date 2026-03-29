import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum PricingUnit {
    MINUTES = 'minutes',
    HOURS = 'hours',
    DAYS = 'days',
}

@Entity('offer_event_pricing')
export class OfferEventPricing {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: ['offer', 'event'],
        default: 'offer'
    })
    @Index()
    type: 'offer' | 'event';

    @Column()
    name: string; // e.g., "1 Hour Promo", "1 Day Standard"

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: PricingUnit,
        default: PricingUnit.HOURS
    })
    unit: PricingUnit;

    @Column({ type: 'int', default: 1 })
    duration: number;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    // ── Placement visibility ──────────────────────────────────────────────
    @Column({ name: 'show_on_home', default: true })
    showOnHome: boolean;

    @Column({ name: 'show_on_category', default: true })
    showOnCategory: boolean;

    @Column({ name: 'show_on_listing', default: true })
    showOnListing: boolean;

    @Column({ name: 'show_on_offer_page', default: true })
    showOnOfferPage: boolean;

    @Column({ name: 'show_on_event_page', default: false })
    showOnEventPage: boolean;

    /**
     * Stripe Price ID — cached after first checkout creation.
     * Used to avoid creating new on-the-fly prices (which hit Stripe's $0.50 minimum).
     * Using recurring subscription mode so there is no minimum charge limit.
     */
    @Column({ name: 'stripe_price_id', nullable: true, default: null })
    stripePriceId: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
