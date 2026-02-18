import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { User } from './user.entity';
import { Business } from './business.entity';
import { Subscription } from './subscription.entity';
import { Transaction } from './transaction.entity';

@Entity('vendors')
export class Vendor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'business_name' })
    businessName: string;

    @Column({ name: 'business_email', nullable: true })
    businessEmail: string;

    @Column({ name: 'business_phone', length: 20 })
    businessPhone: string;

    @Column({ name: 'business_address', nullable: true, type: 'text' })
    businessAddress: string;

    @Column({ name: 'gst_number', nullable: true, length: 15 })
    gstNumber: string;

    @Column({ name: 'pan_number', nullable: true, length: 10 })
    panNumber: string;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'verification_documents', nullable: true, type: 'jsonb' })
    verificationDocuments: Record<string, any>;

    @Column({ name: 'stripe_customer_id', nullable: true, length: 255 })
    @Index()
    stripeCustomerId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToOne(() => User, (user) => user.vendor)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => Business, (business) => business.vendor)
    businesses: Business[];

    @OneToMany(() => Subscription, (subscription) => subscription.vendor)
    subscriptions: Subscription[];

    @OneToMany(() => Transaction, (transaction) => transaction.vendor)
    transactions: Transaction[];
}
