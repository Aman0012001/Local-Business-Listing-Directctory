import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vendor } from './vendor.entity';

@Entity('vendor_attributes')
export class VendorAttribute {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ name: 'vendor_id', type: 'uuid' })
    @Index()
    vendorId: string;

    @ApiProperty()
    @Column({ name: 'attribute_key' })
    @Index()
    attributeKey: string;

    @ApiProperty()
    @Column({ name: 'attribute_value', type: 'text' })
    attributeValue: string;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;
}
