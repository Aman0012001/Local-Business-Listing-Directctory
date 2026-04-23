import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QAQuestion } from '../../entities/qa-question.entity';
import { QAStatus } from '../../entities/qa.enums';
import { QAAnswer } from '../../entities/qa-answer.entity';
import { Listing } from '../../entities/business.entity';
import { User, UserRole } from '../../entities/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ModerateQaDto } from './dto/moderate-qa.dto';

@Injectable()
export class QaService {
    constructor(
        @InjectRepository(QAQuestion)
        private questionRepository: Repository<QAQuestion>,
        @InjectRepository(QAAnswer)
        private answerRepository: Repository<QAAnswer>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
    ) { }

    async createQuestion(dto: CreateQuestionDto, user: User) {
        // Business existence check
        const business = await this.listingRepository.findOne({ where: { id: dto.businessId } });
        if (!business) throw new NotFoundException('Business not found');

        // Spam/Duplicate check: same user, same business, same content in last 1 hour
        const oneHourAgo = new Date(Date.now() - 3600000);
        const existing = await this.questionRepository.findOne({
            where: {
                userId: user.id,
                businessId: dto.businessId,
                content: dto.content,
                createdAt: In([]) // simplified, we use QueryBuilder for range
            }
        });

        // Use more accurate duplicate check
        const duplicate = await this.questionRepository.createQueryBuilder('q')
            .where('q.user_id = :userId', { userId: user.id })
            .andWhere('q.business_id = :businessId', { businessId: dto.businessId })
            .andWhere('q.content = :content', { content: dto.content })
            .andWhere('q.created_at > :oneHourAgo', { oneHourAgo })
            .getOne();

        if (duplicate) {
            throw new BadRequestException('You have already asked this question recently.');
        }

        const question = this.questionRepository.create({
            ...dto,
            userId: user.id,
            status: QAStatus.PENDING,
        });

        return this.questionRepository.save(question);
    }

    async createAnswer(dto: CreateAnswerDto, user: User) {
        const question = await this.questionRepository.findOne({
            where: { id: dto.questionId },
            relations: ['business']
        });

        if (!question) throw new NotFoundException('Question not found');
        if (question.status !== QAStatus.APPROVED) {
            throw new BadRequestException('Cannot answer a pending or rejected question.');
        }

        // Check if user is vendor of this business
        const business = await this.listingRepository.findOne({
            where: { id: question.businessId },
            relations: ['vendor']
        });

        const isOfficial = business?.vendor?.userId === user.id;

        const answer = this.answerRepository.create({
            ...dto,
            userId: user.id,
            status: QAStatus.PENDING,
            isOfficial,
        });

        return this.answerRepository.save(answer);
    }

    async getBusinessQA(businessId: string, isAdmin = false) {
        const questions = await this.questionRepository.find({
            where: {
                businessId,
                ...(isAdmin ? {} : { status: QAStatus.APPROVED })
            },
            relations: ['user', 'answers', 'answers.user'],
            order: { createdAt: 'DESC' }
        });

        return questions.map((q) => {
            let filteredAnswers = q.answers || [];
            if (!isAdmin) {
                filteredAnswers = filteredAnswers.filter(a => a.status === QAStatus.APPROVED);
            }

            filteredAnswers.sort((a, b) => {
                if (a.isOfficial && !b.isOfficial) return -1;
                if (!a.isOfficial && b.isOfficial) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });

            return {
                ...q,
                answers: filteredAnswers,
            };
        });
    }

    // Admin Methods
    async moderateQuestion(id: string, dto: ModerateQaDto) {
        const question = await this.questionRepository.findOne({ where: { id } });
        if (!question) throw new NotFoundException('Question not found');

        question.status = dto.status;
        return this.questionRepository.save(question);
    }

    async moderateAnswer(id: string, dto: ModerateQaDto) {
        const answer = await this.answerRepository.findOne({ where: { id } });
        if (!answer) throw new NotFoundException('Answer not found');

        answer.status = dto.status;
        return this.answerRepository.save(answer);
    }

    async getPendingQA() {
        const [pendingQuestions, pendingAnswers] = await Promise.all([
            this.questionRepository.find({
                where: { status: QAStatus.PENDING },
                relations: ['user', 'business']
            }),
            this.answerRepository.find({
                where: { status: QAStatus.PENDING },
                relations: ['user', 'question', 'question.business']
            })
        ]);

        return {
            questions: pendingQuestions,
            answers: pendingAnswers
        };
    }
}
