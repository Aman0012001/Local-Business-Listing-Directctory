import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessSetupService } from './business-setup.service';
import { SaveAnswersDto } from './dto/save-answers.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('business-setup')
@Controller('business-setup')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessSetupController {
    constructor(private readonly businessSetupService: BusinessSetupService) { }

    @Get('questions')
    @ApiOperation({ summary: 'Get all active business profile questions' })
    @ApiResponse({ status: 200, description: 'List of questions retrieved' })
    async getQuestions() {
        return this.businessSetupService.getQuestions();
    }

    @Get('status')
    @ApiOperation({ summary: 'Check if business setup is completed' })
    async getSetupStatus(@CurrentUser() user: User) {
        return this.businessSetupService.getSetupStatus(user.id);
    }

    @Post('answers')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Save vendor responses to questions' })
    @ApiResponse({ status: 200, description: 'Answers saved successfully' })
    async saveAnswers(@CurrentUser() user: User, @Body() dto: SaveAnswersDto) {
        return this.businessSetupService.saveAnswers(user.id, dto);
    }
}
