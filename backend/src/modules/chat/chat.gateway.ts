import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../notifications/ws-jwt.guard';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private chatService: ChatService) {}

    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChatGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected to chat: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from chat: ${client.id}`);
    }

    @SubscribeMessage('joinRoom')
    @UseGuards(WsJwtGuard)
    async handleJoinRoom(
        @ConnectedSocket() client: any,
        @MessageBody('conversationId') conversationId: string,
    ) {
        client.join(conversationId);
        this.logger.log(`User ${client.user.id} joined conversation ${conversationId}`);
        return { status: 'joined', conversationId };
    }

    @SubscribeMessage('sendMessage')
    @UseGuards(WsJwtGuard)
    async handleSendMessage(
        @ConnectedSocket() client: any,
        @MessageBody() data: SendMessageDto,
    ) {
        const userId = client.user.id;
        try {
            const message = await this.chatService.sendMessage(
                userId,
                data.conversationId,
                data.content,
            );

            // Broadcast message back to the room
            this.server.to(data.conversationId).emit('newMessage', message);
            
            return { status: 'success', message };
        } catch (error) {
            this.logger.error(`Error sending message: ${error.message}`);
            return { status: 'error', message: error.message };
        }
    }

    @SubscribeMessage('typing')
    @UseGuards(WsJwtGuard)
    async handleTyping(
        @ConnectedSocket() client: any,
        @MessageBody('conversationId') conversationId: string,
    ) {
        client.to(conversationId).emit('userTyping', {
            userId: client.user.id,
            conversationId,
        });
    }
}
