import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentStatus } from '../../entities/comment.entity';
import { CommentReply } from '../../entities/comment-reply.entity';
import { Listing } from '../../entities/business.entity';
import { Vendor } from '../../entities/vendor.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReplyCommentDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(Comment)
        private commentRepo: Repository<Comment>,
        @InjectRepository(CommentReply)
        private replyRepo: Repository<CommentReply>,
        @InjectRepository(Listing)
        private listingRepo: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepo: Repository<Vendor>,
    ) { }

    async create(userId: string, dto: CreateCommentDto) {
        const listing = await this.listingRepo.findOne({ where: { id: dto.businessId } });
        if (!listing) throw new NotFoundException('Business not found');

        const comment = this.commentRepo.create({
            ...dto,
            userId,
        });

        const saved = await this.commentRepo.save(comment);

        // Update business rating
        await this.updateBusinessRating(dto.businessId);

        return saved;
    }

    async findPublicByBusiness(businessId: string, page = 1, limit = 10) {
        const [data, total] = await this.commentRepo.findAndCount({
            where: { businessId, status: CommentStatus.VISIBLE },
            relations: ['user', 'reply', 'reply.vendor'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip: (page - 1) * limit,
        });

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findVendorComments(userId: string, page = 1, limit = 10) {
        const vendor = await this.vendorRepo.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException('Only vendors can access this');

        // Fetch comments for businesses owned by this vendor
        const [data, total] = await this.commentRepo.createQueryBuilder('comment')
            .leftJoinAndSelect('comment.business', 'business')
            .leftJoinAndSelect('comment.user', 'user')
            .leftJoinAndSelect('comment.reply', 'reply')
            .where('business.vendorId = :vendorId', { vendorId: vendor.id })
            .orderBy('comment.createdAt', 'DESC')
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async reply(userId: string, commentId: string, dto: ReplyCommentDto) {
        const vendor = await this.vendorRepo.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException('Only vendors can reply');

        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['business', 'reply'],
        });

        if (!comment) throw new NotFoundException('Comment not found');
        if (comment.reply) throw new ConflictException('Comment already has a reply');

        // Verify ownership
        if (comment.business.vendorId !== vendor.id) {
            throw new ForbiddenException('You can only reply to comments for your own businesses');
        }

        const reply = this.replyRepo.create({
            commentId,
            vendorId: vendor.id,
            replyText: dto.replyText,
        });

        return this.replyRepo.save(reply);
    }

    async updateReply(userId: string, replyId: string, dto: UpdateReplyDto) {
        const vendor = await this.vendorRepo.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException();

        const reply = await this.replyRepo.findOne({ where: { id: replyId } });
        if (!reply) throw new NotFoundException('Reply not found');

        if (reply.vendorId !== vendor.id) {
            throw new ForbiddenException('You can only edit your own replies');
        }

        Object.assign(reply, dto);
        return this.replyRepo.save(reply);
    }

    async removeReply(userId: string, replyId: string) {
        const vendor = await this.vendorRepo.findOne({ where: { userId } });
        if (!vendor) throw new ForbiddenException();

        const reply = await this.replyRepo.findOne({ where: { id: replyId } });
        if (!reply) throw new NotFoundException('Reply not found');

        if (reply.vendorId !== vendor.id) {
            throw new ForbiddenException('You can only delete your own replies');
        }

        return this.replyRepo.remove(reply);
    }

    // Admin moderation
    async updateStatus(commentId: string, status: CommentStatus) {
        const comment = await this.commentRepo.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');
        comment.status = status;
        const saved = await this.commentRepo.save(comment);

        // Update business rating
        await this.updateBusinessRating(comment.businessId);

        return saved;
    }

    async remove(commentId: string) {
        const comment = await this.commentRepo.findOne({ where: { id: commentId } });
        if (!comment) throw new NotFoundException('Comment not found');
        const businessId = comment.businessId;
        const removed = await this.commentRepo.remove(comment);

        // Update business rating
        await this.updateBusinessRating(businessId);

        return removed;
    }

    /**
     * Update business average rating and total reviews from comments
     */
    private async updateBusinessRating(businessId: string): Promise<void> {
        const result = await this.commentRepo
            .createQueryBuilder('comment')
            .select('AVG(comment.rating)', 'averageRating')
            .addSelect('COUNT(*)', 'totalReviews')
            .where('comment.businessId = :businessId', { businessId })
            .andWhere('comment.status = :status', { status: CommentStatus.VISIBLE })
            .andWhere('comment.rating IS NOT NULL')
            .getRawOne();

        const averageRating = parseFloat(result.averageRating) || 0;
        const totalReviews = parseInt(result.totalReviews) || 0;

        await this.listingRepo.update(businessId, {
            averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimals
            totalReviews,
        });
    }
}
