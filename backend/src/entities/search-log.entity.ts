import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('search_logs')
export class SearchLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Index()
    keyword: string;

    @Column({ name: 'normalized_keyword' })
    @Index()
    normalizedKeyword: string;

    @Column({ name: 'user_id', type: 'uuid', nullable: true })
    @Index()
    userId: string;

    @CreateDateColumn({ name: 'searched_at' })
    @Index()
    searchedAt: Date;

    @Column({ nullable: true })
    city: string;

    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude: number;

    // Relations
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
