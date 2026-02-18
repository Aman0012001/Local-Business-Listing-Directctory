import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    OneToMany,
} from 'typeorm';
import { Vendor } from './vendor.entity';
import { Review } from './review.entity';
import { Lead } from './lead.entity';
import { Favorite } from './favorite.entity';
import { Notification } from './notification.entity';

export enum UserRole {
    USER = 'user',
    VENDOR = 'vendor',
    ADMIN = 'admin',
<<<<<<< HEAD
    SUPERADMIN = 'superadmin',
=======
>>>>>>> 56a7fdc8c2ec25ddd88e6b87bd06bfa1d2117cca
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true, select: false })
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, length: 20 })
    phone: string;

    @Column({ name: 'full_name' })
    fullName: string;

    @Column({ name: 'avatar_url', nullable: true, type: 'text' })
    avatarUrl: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ name: 'is_email_verified', default: false })
    isEmailVerified: boolean;

    @Column({ name: 'is_phone_verified', default: false })
    isPhoneVerified: boolean;

    @Column({ name: 'last_login_at', nullable: true, type: 'timestamp' })
    lastLoginAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToOne(() => Vendor, (vendor) => vendor.user)
    vendor: Vendor;

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => Lead, (lead) => lead.user)
    leads: Lead[];

    @OneToMany(() => Favorite, (favorite) => favorite.user)
    favorites: Favorite[];

    @OneToMany(() => Notification, (notification) => notification.user)
    notifications: Notification[];
}
