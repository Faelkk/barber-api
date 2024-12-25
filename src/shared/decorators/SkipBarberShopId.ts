import { SetMetadata } from '@nestjs/common';

export const SkipBarberShopIdCheck = () =>
  SetMetadata('skipBarberShopIdCheck', true);
