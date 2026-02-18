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
import { Vendor } from './vendor.entity';
import { Category } from './category.entity';
import { BusinessHours } from './business-hours.entity';
import { BusinessAmenity } from './business-amenity.entity';
import { Review } from './review.entity';
import { Lead } from './lead.entity';
import { Favorite } from './favorite.entity';

export enum BusinessStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    SUSPENDED = 'suspended',
}

@Entity('businesses')
@Index(['latitude', 'longitude'])
export class Business {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'vendor_id', type: 'uuid' })
    vendorId: string;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId: string;

    // Basic Info
    @Column()
    @Index()
    name: string;

    @Column({ unique: true })
    @Index()
    slug: string;

    @Column({ nullable: true, type: 'text' })
    description: string;

    @Column({ name: 'short_description', nullable: true, length: 500 })
    shortDescription: string;

    // Contact
    @Column({ nullable: true })
    email: string;

    @Column({ length: 20 })
    phone: string;

    @Column({ nullable: true, length: 20 })
    whatsapp: string;

    @Column({ nullable: true })
    website: string;

    // Location
    @Column({ type: 'text' })
    address: string;

    @Column({ length: 100, nullable: true })
    @Index()
    city: string;

    @Column({ length: 100, nullable: true })
    state: string;

    @Column({ length: 100, default: 'Pakistan', nullable: true })
    country: string;

    @Column({ length: 10, nullable: true })
    @Index()
    pincode: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    /*
    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    @Index({ spatial: true })
    location: string;
    */

    // Media
    @Column({ name: 'logo_url', nullable: true, type: 'text' })
    logoUrl: string;

    @Column({ name: 'cover_image_url', nullable: true, type: 'text' })
    coverImageUrl: string;

    @Column({ type: 'jsonb', default: '[]' })
    images: string[];

    @Column({ type: 'jsonb', default: '[]' })
    videos: string[];

    // Business Details
    @Column({ name: 'year_established', nullable: true })
    yearEstablished: number;

    @Column({ name: 'employee_count', nullable: true, length: 50 })
    employeeCount: string;

    @Column({ name: 'price_range', nullable: true, length: 10 })
    priceRange: string;

    // Status & Ratings
    @Column({
        type: 'enum',
        enum: BusinessStatus,
        default: BusinessStatus.PENDING,
    })
    @Index()
    status: BusinessStatus;

    @Column({ name: 'is_verified', default: false })
    isVerified: boolean;

    @Column({ name: 'is_featured', default: false })
    @Index()
    isFeatured: boolean;

    @Column({ name: 'is_sponsored', default: false })
    @Index()
    isSponsored: boolean;

    @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
    @Index()
    averageRating: number;

    @Column({ name: 'total_reviews', default: 0 })
    totalReviews: number;

    @Column({ name: 'total_views', default: 0 })
    totalViews: number;

    @Column({ name: 'total_leads', default: 0 })
    totalLeads: number;

    // SEO
    @Column({ name: 'meta_title', nullable: true })
    metaTitle: string;

    @Column({ name: 'meta_description', nullable: true, type: 'text' })
    metaDescription: string;

    @Column({ name: 'meta_keywords', nullable: true, type: 'text' })
    metaKeywords: string;

    // Approval
    @Column({ name: 'approved_at', nullable: true, type: 'timestamp' })
    approvedAt: Date;

    @Column({ name: 'rejected_at', nullable: true, type: 'timestamp' })
    rejectedAt: Date;

    @Column({ name: 'rejection_reason', nullable: true, type: 'text' })
    rejectionReason: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Vendor, (vendor) => vendor.businesses)
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;

    @ManyToOne(() => Category, (category) => category.businesses)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @OneToMany(() => BusinessHours, (hours) => hours.business)
    businessHours: BusinessHours[];

    @OneToMany(() => BusinessAmenity, (amenity) => amenity.business)
    businessAmenities: BusinessAmenity[];

    @OneToMany(() => Review, (review) => review.business)
    reviews: Review[];

    @OneToMany(() => Lead, (lead) => lead.business)
    leads: Lead[];

    @OneToMany(() => Favorite, (favorite) => favorite.business)
    favorites: Favorite[];
}
