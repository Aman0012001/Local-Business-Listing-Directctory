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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
