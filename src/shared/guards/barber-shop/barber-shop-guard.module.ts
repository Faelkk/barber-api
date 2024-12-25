import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BarberShopAccessGuard } from './barber-shop-guard';

@Module({
  providers: [BarberShopAccessGuard, Reflector],
  exports: [BarberShopAccessGuard],
})
export class BarberShopGuardModule {}
