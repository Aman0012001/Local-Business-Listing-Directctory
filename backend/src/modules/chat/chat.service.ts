import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository, InjectEntityManager } from '@nestjs/typeorm';
import { Repository, Not, EntityManager } from 'typeorm';
import { ChatConversation, ChatMessage, User, Listing, Vendor } from '../../entities';
import { LeadsService } from '../leads/leads.service';
import { NotificationsService, NotificationType } from '../notifications/notifications.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatConversation)
        private conversationRepository: Repository<ChatConversation>,
        @InjectRepository(ChatMessage)
        private messageRepository: Repository<ChatMessage>,
        @InjectRepository(Listing)
        private listingRepository: Repository<Listing>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
        @Inject(forwardRef(() => LeadsService))
        private leadsService: LeadsService,
        private notificationsService: NotificationsService,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getOrCreateConversation(userId: string, businessId: string) {
        let conversation = await this.conversationRepository.findOne({
            where: { userId, businessId },
            relations: ['business', 'user', 'vendor'],
        });

        if (!conversation) {
            const business = await this.listingRepository.findOne({
                where: { id: businessId },
                relations: ['vendor'],
            });

            if (!business) {
                throw new NotFoundException('Business not found');
            }

            conversation = this.conversationRepository.create({
                userId,
                businessId,
                vendorId: business.vendor.id,
            });
            await this.conversationRepository.save(conversation);

            // Reload with relations for the response
            conversation = await this.conversationRepository.findOne({
                where: { id: conversation.id },
                relations: ['business', 'user', 'vendor'],
            });

        }

        return conversation;
    }

    async getConversationById(conversationId: string) {
        return this.conversationRepository.findOne({
            where: { id: conversationId },
        });
    }

    async sendMessage(userId: string, conversationId: string, content: string) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        // Check if user is part of conversation (either customer or vendor)
        const isCustomer = conversation.userId === userId;
        const vendor = await this.vendorRepository.findOne({ where: { id: conversation.vendorId } });
        const isVendor = vendor?.userId === userId;

        if (!isCustomer && !isVendor) {
            throw new ForbiddenException('Not authorized to send message in this conversation');
        }

        const message = this.messageRepository.create({
            conversationId,
            senderId: userId,
            content,
        });

        const savedMessage = await this.messageRepository.save(message);

        // Update last message in conversation
        await this.conversationRepository.update(conversationId, {
            lastMessage: content,
            lastMessageAt: new Date(),
        });

        // Send real-time notification to the recipient
        const recipientId = isCustomer ? vendor?.userId : conversation.userId;
        if (recipientId) {
            this.notificationsService.create({
                userId: recipientId,
                title: isCustomer ? 'New Message' : 'Message from Business',
                message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                type: NotificationType.CHAT_MESSAGE,
                data: { conversationId, senderId: userId },
                link: `/chat?id=${conversationId}`,
            }).catch(err => console.error('[ChatService] Notification failed:', err.message));
        }

        return savedMessage;
    }

    async getConversationHistory(conversationId: string, userId: string) {
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        const vendor = await this.vendorRepository.findOne({ where: { id: conversation.vendorId } });
        const isVendorOwner = vendor?.userId === userId;

        if (conversation.userId !== userId && !isVendorOwner) {
            throw new ForbiddenException('Not authorized to view this conversation');
        }

        return this.messageRepository.find({
            where: { conversationId },
            order: { createdAt: 'ASC' },
            relations: ['sender'],
        });
    }

    async getUserConversations(userId: string) {
        return this.conversationRepository.find({
            where: { userId },
            relations: ['business', 'vendor'],
            order: { lastMessageAt: 'DESC' },
        });
    }

    async getVendorConversations(vendorId: string) {
        return this.conversationRepository.find({
            where: { vendorId },
            relations: ['user', 'business'],
            order: { lastMessageAt: 'DESC' },
        });
    }

    async getVendorConversationsByUserId(userId: string) {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) return [];
        return this.getVendorConversations(vendor.id);
    }

    async getUnreadCount(userId: string): Promise<number> {
        const result = await this.messageRepository
            .createQueryBuilder('message')
            .innerJoin('message.conversation', 'conversation')
            .leftJoin('conversation.vendor', 'vendor')
            .select('COUNT(DISTINCT message.conversation_id)', 'count')
            .where('message.is_read = :isRead', { isRead: false })
            .andWhere('message.sender_id != :userId', { userId })
            .andWhere('(conversation.user_id = :userId OR vendor.user_id = :userId)', { userId })
            .getRawOne();
            
        return parseInt(result?.count || '0');
    }

    async markAsRead(conversationId: string, userId: string): Promise<void> {
        await this.messageRepository.update(
            { conversationId, senderId: Not(userId), isRead: false },
            { isRead: true }
        );
    }
}
