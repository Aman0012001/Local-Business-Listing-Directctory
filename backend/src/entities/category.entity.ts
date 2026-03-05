import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Listing } from './business.entity';

export enum CategoryStatus {
    ACTIVE = 'active',
    DISABLED = 'disabled',
}

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 100 })
    @Index()
    name: string;

    @Column({ unique: true, length: 100 })
    @Index()
    slug: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ name: 'icon', nullable: true, type: 'text' })
    icon: string;

    @Column({ name: 'image_url', nullable: true, type: 'text' })
    imageUrl: string;

    @Column({ name: 'display_order', default: 0 })
    displayOrder: number;

    @Column({
        type: 'enum',
        enum: CategoryStatus,
        default: CategoryStatus.ACTIVE,
    })
    @Index()
    status: CategoryStatus;

    @Column({ name: 'meta_title', nullable: true })
    metaTitle: string;

    @Column({ name: 'meta_description', nullable: true, type: 'text' })
    metaDescription: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @Exclude()
    @OneToMany(() => Listing, (listing) => listing.category)
    businesses: Listing[];
}
