import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from './ws-jwt.guard';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private connectedUsers: Map<string, string[]> = new Map(); // userId -> socketIds

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        // Remove from connected users map
        for (const [userId, sockets] of this.connectedUsers.entries()) {
            if (sockets.includes(client.id)) {
                const updatedSockets = sockets.filter(id => id !== client.id);
                if (updatedSockets.length === 0) {
                    this.connectedUsers.delete(userId);
                } else {
                    this.connectedUsers.set(userId, updatedSockets);
                }
                break;
            }
        }
    }

    @SubscribeMessage('authenticate')
    @UseGuards(WsJwtGuard)
    handleAuthenticate(client: any) {
        const userId = client.user.id;
        const sockets = this.connectedUsers.get(userId) || [];
        if (!sockets.includes(client.id)) {
            sockets.push(client.id);
        }
        this.connectedUsers.set(userId, sockets);
        this.logger.log(`User ${userId} authenticated on socket ${client.id}`);
        return { status: 'authenticated' };
    }

    sendToUser(userId: string, event: string, data: any) {
        const sockets = this.connectedUsers.get(userId);
        if (sockets) {
            sockets.forEach(socketId => {
                this.server.to(socketId).emit(event, data);
            });
            this.logger.log(`Notification sent to user ${userId}: ${event}`);
        } else {
            this.logger.log(`User ${userId} not connected, notification stored? (future)`);
        }
    }
}
