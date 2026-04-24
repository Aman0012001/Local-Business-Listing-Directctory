import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService implements OnModuleInit {
    private readonly logger = new Logger(FcmService.name);
    private isInitialized = false;

    constructor(private configService: ConfigService) {}

    onModuleInit() {
        try {
            const serviceAccountPath = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_PATH');
            
            // Alternatively, allow passing the JSON string directly in env
            const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT_JSON');

            if (serviceAccountPath) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccountPath),
                });
                this.isInitialized = true;
                this.logger.log('Firebase Admin SDK initialized using path');
            } else if (serviceAccountJson) {
                const config = JSON.parse(serviceAccountJson);
                admin.initializeApp({
                    credential: admin.credential.cert(config),
                });
                this.isInitialized = true;
                this.logger.log('Firebase Admin SDK initialized using JSON env');
            } else {
                this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH/JSON not found in environment. FCM disabled.');
            }
        } catch (error) {
            this.logger.error(`Failed to initialize Firebase Admin: ${error.message}`);
        }
    }

    async sendToDevice(token: string, payload: { title: string; body: string; data?: any }) {
        if (!this.isInitialized) {
            this.logger.debug('FCM not initialized, skipping sendToDevice');
            return;
        }

        try {
            await admin.messaging().send({
                token,
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK', // Common for mobile
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            contentAvailable: true,
                            sound: 'default',
                        },
                    },
                },
            });
            this.logger.log(`FCM message sent to token ${token.substring(0, 10)}...`);
        } catch (error) {
            this.logger.error(`FCM send failed: ${error.message}`);
        }
    }
}
