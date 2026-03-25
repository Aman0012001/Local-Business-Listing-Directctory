import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateConversationDto } from './dto/chat.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('conversations')
    @ApiOperation({ summary: 'Get or create a conversation with a business' })
    async getOrCreateConversation(
        @Request() req: any,
        @Body() body: CreateConversationDto,
    ) {
        return this.chatService.getOrCreateConversation(req.user.id, body.businessId);
    }

    @Get('conversations/user')
    @ApiOperation({ summary: 'Get all conversations for the current user' })
    async getUserConversations(@Request() req: any) {
        return this.chatService.getUserConversations(req.user.id);
    }

    @Get('conversations/vendor')
    @ApiOperation({ summary: 'Get all conversations for the current vendor' })
    async getVendorConversations(@Request() req: any) {
        return this.chatService.getVendorConversationsByUserId(req.user.id);
    }

    @Get('conversations/:id/messages')
    @ApiOperation({ summary: 'Get message history for a conversation' })
    async getMessages(@Request() req: any, @Param('id') id: string) {
        return this.chatService.getConversationHistory(id, req.user.id);
    }
}
