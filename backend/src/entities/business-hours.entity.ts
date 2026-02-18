import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Business } from './business.entity';

export enum DayOfWeek {
    MONDAY = 'monday',
    TUESDAY = 'tuesday',
    WEDNESDAY = 'wednesday',
    THURSDAY = 'thursday',
    FRIDAY = 'friday',
    SATURDAY = 'saturday',
    SUNDAY = 'sunday',
}

@Entity('business_hours')
export class BusinessHours {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'business_id', type: 'uuid' })
    businessId: string;

    @Column({
        name: 'day_of_week',
        type: 'enum',
        enum: DayOfWeek,
    })
    dayOfWeek: DayOfWeek;

    @Column({ name: 'is_open', default: true })
    isOpen: boolean;

    @Column({ name: 'open_time', nullable: true, type: 'time' })
    openTime: string;

    @Column({ name: 'close_time', nullable: true, type: 'time' })
    closeTime: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    // Relations
    @ManyToOne(() => Business, (business) => business.businessHours)
    @JoinColumn({ name: 'business_id' })
    business: Business;
}
