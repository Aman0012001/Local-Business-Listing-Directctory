import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QaController } from './qa.controller';
import { QaService } from './qa.service';
import { QAQuestion } from '../../entities/qa-question.entity';
import { QAAnswer } from '../../entities/qa-answer.entity';
import { Listing } from '../../entities/business.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([QAQuestion, QAAnswer, Listing]),
    ],
    controllers: [QaController],
    providers: [QaService],
    exports: [QaService],
})
export class QaModule { }
