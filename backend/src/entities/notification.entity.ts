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

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({ nullable: true, length: 50 })
    type: string;

    @Column({ nullable: true, type: 'jsonb' })
    data: Record<string, any>;

    @Column({ name: 'is_read', default: false })
    @Index()
    isRead: boolean;

    @Column({ name: 'read_at', nullable: true, type: 'timestamp' })
    readAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    @Index()
    createdAt: Date;

    // Relations
    @ManyToOne(() => User, (user) => user.notifications)
    @JoinColumn({ name: 'user_id' })
    user: User;
}
