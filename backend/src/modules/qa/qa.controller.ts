import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QaService } from './qa.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { ModerateQaDto } from './dto/moderate-qa.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../../entities/user.entity';
import { ParseUuidPipe } from '../../common/pipes/parse-uuid.pipe';

@ApiTags('qa')
@Controller('qa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QaController {
    constructor(private readonly qaService: QaService) { }

    @Post('questions')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ask a question about a business' })
    @ApiResponse({ status: 201, description: 'Question submitted and pending approval' })
    @ApiResponse({ status: 400, description: 'Invalid input data' })
    createQuestion(@Body() dto: CreateQuestionDto, @CurrentUser() user: User) {
        return this.qaService.createQuestion(dto, user);
    }

    @Post('answers')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Answer a business question' })
    @ApiResponse({ status: 201, description: 'Answer submitted and pending approval' })
    createAnswer(@Body() dto: CreateAnswerDto, @CurrentUser() user: User) {
        return this.qaService.createAnswer(dto, user);
    }

    @Public()
    @Get('business/:businessId')
    @ApiOperation({ summary: 'Get all approved Q&A for a business' })
    @ApiResponse({ status: 200, description: 'List of approved Q&A' })
    getBusinessQA(@Param('businessId', ParseUuidPipe) businessId: string) {
        return this.qaService.getBusinessQA(businessId);
    }

    // Admin/Moderation Endpoints
    @Get('admin/pending')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all pending Q&A for moderation' })
    @ApiResponse({ status: 200, description: 'List of pending Q&A items' })
    getPendingQA() {
        return this.qaService.getPendingQA();
    }

    @Patch('admin/questions/:id/moderate')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Moderate (approve/reject) a question' })
    @ApiResponse({ status: 200, description: 'Question moderation status updated' })
    moderateQuestion(
        @Param('id', ParseUuidPipe) id: string,
        @Body() dto: ModerateQaDto
    ) {
        return this.qaService.moderateQuestion(id, dto);
    }

    @Patch('admin/answers/:id/moderate')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Moderate (approve/reject) an answer' })
    @ApiResponse({ status: 200, description: 'Answer moderation status updated' })
    moderateAnswer(
        @Param('id', ParseUuidPipe) id: string,
        @Body() dto: ModerateQaDto
    ) {
        return this.qaService.moderateAnswer(id, dto);
    }
}
