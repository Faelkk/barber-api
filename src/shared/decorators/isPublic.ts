import { SetMetadata } from '@nestjs/common';

export const isPublicKey = 'IS_PUBLIC';
export const IsPublic = () => SetMetadata(isPublicKey, true);
