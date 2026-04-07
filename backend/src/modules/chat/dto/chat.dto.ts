import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class SendMessageDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUUID()
    @IsNotEmpty()
    conversationId: string;
}

export class CreateConversationDto {
    @IsUUID()
    @IsNotEmpty()
    businessId: string;
}
