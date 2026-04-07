import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const generateReferralCode = customAlphabet(alphabet, 10);
