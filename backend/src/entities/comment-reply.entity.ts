import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { Vendor } from './vendor.entity';

@Entity('comment_replies')
export class CommentReply {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'comment_id' })
    commentId: string;

    @Column({ name: 'vendor_id' })
    vendorId: string;

    @Column({ name: 'reply_text', type: 'text' })
    replyText: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @OneToOne(() => Comment, (comment) => comment.reply, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'comment_id' })
    comment: Comment;

    @ManyToOne(() => Vendor, (vendor) => vendor.replies)
    @JoinColumn({ name: 'vendor_id' })
    vendor: Vendor;
}
