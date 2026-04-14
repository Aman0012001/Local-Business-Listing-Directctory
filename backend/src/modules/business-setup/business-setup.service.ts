import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BusinessQuestion } from '../../entities/business-question.entity';
import { VendorAttribute } from '../../entities/vendor-attribute.entity';
import { Vendor } from '../../entities/vendor.entity';
import { SaveAnswersDto } from './dto/save-answers.dto';

@Injectable()
export class BusinessSetupService {
    private readonly logger = new Logger(BusinessSetupService.name);

    constructor(
        @InjectRepository(BusinessQuestion)
        private questionRepository: Repository<BusinessQuestion>,
        @InjectRepository(VendorAttribute)
        private attributeRepository: Repository<VendorAttribute>,
        @InjectRepository(Vendor)
        private vendorRepository: Repository<Vendor>,
    ) { }

    async getQuestions(): Promise<BusinessQuestion[]> {
        const questions = await this.questionRepository.find({
            where: { isActive: true },
            order: { category: 'ASC', order: 'ASC' },
        });

        if (questions.length === 0) {
            this.logger.log('No questions found in database, returning fallbacks.');
            // Fallback questions to ensure the 4-step wizard works even without seeding
            return [
                {
                    id: 'fallback-1',
                    category: 'Service Mode',
                    question: 'How do you provide your services?',
                    options: ['Home Service', 'In-store / Studio', 'Online / Virtual', 'Emergency Services'],
                    isActive: true,
                    order: 1,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'fallback-2',
                    category: 'Payment Methods',
                    question: 'Which payment methods do you accept?',
                    options: ['Cash', 'UPI / QR Code', 'Credit/Debit Card', 'Net Banking', 'Digital Wallets'],
                    isActive: true,
                    order: 2,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'fallback-3',
                    category: 'Business Features',
                    question: 'What amenities or features does your business offer?',
                    options: ['WiFi Available', 'Parking Space', 'Air Conditioned', 'Wheelchair Accessible', 'Waiting Area', 'Contactless Delivery'],
                    isActive: true,
                    order: 3,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ] as BusinessQuestion[];
        }

        return questions;
    }

    async getSetupStatus(userId: string): Promise<{ isCompleted: boolean; answers: Record<string, string[]> }> {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) return { isCompleted: false, answers: {} };

        const savedAttributes = await this.attributeRepository.find({ where: { vendorId: vendor.id } });
        
        const answers: Record<string, string[]> = {};
        savedAttributes.forEach(attr => {
            if (!answers[attr.attributeKey]) {
                answers[attr.attributeKey] = [];
            }
            answers[attr.attributeKey].push(attr.attributeValue);
        });

        // Consider it completed if at least 3 categories have been answered
        // (excluding basic info like city/state)
        const categories = new Set<string>();
        savedAttributes.forEach(attr => {
            if (!['city', 'state', 'country'].includes(attr.attributeKey)) {
                categories.add(attr.attributeKey);
            }
        });

        return { 
            isCompleted: categories.size >= 3, 
            answers 
        };
    }

    async saveAnswers(userId: string, dto: SaveAnswersDto): Promise<{ success: boolean }> {
        const vendor = await this.vendorRepository.findOne({ where: { userId } });
        if (!vendor) {
            throw new BadRequestException('Vendor profile not found');
        }

        const { answers } = dto;
        const vendorId = vendor.id;

        // Atomic update: Delete old answers for the keys being updated and insert new ones
        // In a real production system, you might want to wrap this in a transaction
        for (const [key, value] of Object.entries(answers)) {
            // Delete existing for this key
            await this.attributeRepository.delete({ vendorId, attributeKey: key });

            // Insert new ones
            if (Array.isArray(value)) {
                const attributes = value.map(val => this.attributeRepository.create({
                    vendorId,
                    attributeKey: key,
                    attributeValue: val,
                }));
                await this.attributeRepository.save(attributes);
            } else if (value) {
                const attribute = this.attributeRepository.create({
                    vendorId,
                    attributeKey: key,
                    attributeValue: value,
                });
                await this.attributeRepository.save(attribute);
            }
        }

        return { success: true };
    }
}
