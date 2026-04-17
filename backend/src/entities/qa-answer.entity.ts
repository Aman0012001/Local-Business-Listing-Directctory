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
import { User } from './user.entity';
import { QAQuestion, QAStatus } from './qa-question.entity';

@Entity('qa_answers')
export class QAAnswer {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column({ name: 'question_id', type: 'uuid' })
    @Index()
    questionId: string;

    @ManyToOne(() => QAQuestion, (question) => question.answers)
    @JoinColumn({ name: 'question_id' })
    question: QAQuestion;

    @ApiProperty()
    @Column({ name: 'user_id', type: 'uuid' })
    @Index()
    userId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiProperty()
    @Column({ type: 'text' })
    content: string;

    @ApiProperty({ enum: QAStatus })
    @Column({
        type: 'enum',
        enum: QAStatus,
        default: QAStatus.PENDING,
    })
    status: QAStatus;

    @ApiProperty()
    @Column({ name: 'is_official', default: false })
    isOfficial: boolean;

    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
