import { SetMetadata } from '@nestjs/common';

export const CHECK_FEATURE_KEY = 'check_feature';
export const CheckFeature = (feature: string) => SetMetadata(CHECK_FEATURE_KEY, feature);
