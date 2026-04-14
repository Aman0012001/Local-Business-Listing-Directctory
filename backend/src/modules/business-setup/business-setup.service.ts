import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BusinessQuestion, VendorAttribute, Vendor } from '../../entities';
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
        return this.questionRepository.find({
            where: { isActive: true },
            order: { category: 'ASC', order: 'ASC' },
        });
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
