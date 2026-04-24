import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as webpush from 'web-push';
import { FcmService } from './fcm.service';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);
    private readonly isWebPushConfigured: boolean;

    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private fcmService: FcmService,
    ) {
        const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
        const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
        const mailto = this.configService.get<string>('VAPID_MAILTO');

        if (publicKey && privateKey && mailto) {
            webpush.setVapidDetails(mailto, publicKey, privateKey);
            this.isWebPushConfigured = true;
            this.logger.log('Web Push (VAPID) configured successfully');
        } else {
            this.isWebPushConfigured = false;
            this.logger.warn('Web Push: VAPID keys missing – Web Push disabled');
        }
    }

    /** Get the VAPID public key for the browser */
    getPublicKey(): string {
        return this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
    }

    /**
     * Save (or update) a push subscription for a user.
     * Stores them in the user's pushSubscriptions array (deduped by endpoint).
     */
    async saveSubscription(userId: string, subscription: webpush.PushSubscription): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'pushSubscriptions'],
        });
        if (!user) return;

        const existing: webpush.PushSubscription[] = Array.isArray(user.pushSubscriptions)
            ? user.pushSubscriptions
            : [];

        // Remove old entry with same endpoint (update keys if rotated)
        const filtered = existing.filter((s) => s.endpoint !== subscription.endpoint);
        filtered.push(subscription);

        await this.userRepo.update(userId, { pushSubscriptions: filtered } as any);
        this.logger.log(`Push subscription saved for user ${userId} (total: ${filtered.length})`);
    }

    /** Remove a specific subscription for a user */
    async removeSubscription(userId: string, endpoint: string): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'pushSubscriptions'],
        });
        if (!user) return;

        const filtered = (user.pushSubscriptions || []).filter(
            (s: any) => s.endpoint !== endpoint,
        );
        await this.userRepo.update(userId, { pushSubscriptions: filtered } as any);
    }

    /**
     * Send a Web Push notification to all subscriptions of a user.
     * Automatically cleans up expired/invalid subscriptions (HTTP 410).
     */
    async sendToUser(
        userId: string,
        payload: { title: string; message: string; type?: string; url?: string },
    ): Promise<void> {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ['id', 'pushSubscriptions', 'deviceToken'],
        });

        if (!user) return;

        // 1. Send via FCM if device token is present
        if (user.deviceToken) {
            this.fcmService.sendToDevice(user.deviceToken, {
                title: payload.title,
                body: payload.message,
                data: {
                    type: payload.type || 'notification',
                    url: payload.url || '/notifications',
                }
            }).catch(err => this.logger.error(`FCM failed for user ${userId}: ${err.message}`));
        }

        // 2. Send via Web Push if subscriptions are present
        if (this.isWebPushConfigured && Array.isArray(user.pushSubscriptions) && user.pushSubscriptions.length > 0) {
            const push = JSON.stringify({
                title: payload.title,
                body: payload.message,
                icon: '/logo.png',
                badge: '/logo.png',
                tag: payload.type || 'notification',
                data: { url: payload.url || '/notifications' },
            });

        const invalidEndpoints: string[] = [];

        await Promise.allSettled(
            user.pushSubscriptions.map(async (sub: any) => {
                try {
                    await webpush.sendNotification(sub as webpush.PushSubscription, push);
                    this.logger.debug(`Push sent to user ${userId} @ ${sub.endpoint.slice(-20)}`);
                } catch (err: any) {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired or unsubscribed
                        invalidEndpoints.push(sub.endpoint);
                        this.logger.warn(`Removing expired subscription for user ${userId}`);
                    } else {
                        this.logger.error(`Push failed for user ${userId}: ${err.message}`);
                    }
                }
            }),
        );

            // Clean up invalid subscriptions
            if (invalidEndpoints.length > 0) {
                const valid = user.pushSubscriptions.filter(
                    (s: any) => !invalidEndpoints.includes(s.endpoint),
                );
                await this.userRepo.update(userId, { pushSubscriptions: valid } as any);
            }
        }
    }
}

