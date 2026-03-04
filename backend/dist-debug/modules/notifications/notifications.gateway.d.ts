import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedUsers;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleAuthenticate(client: any): {
        status: string;
    };
    sendToUser(userId: string, event: string, data: any): void;
}
