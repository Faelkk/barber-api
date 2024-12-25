import { Module } from '@nestjs/common';

import { env } from 'src/shared/config/env';
import { MongooseModule } from '@nestjs/mongoose';
import { unitSchema } from 'src/shared/schemas/unit.schema';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseModule } from 'src/shared/supabase/supabase.module';
import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';
import { localServiceSchema } from 'src/shared/schemas/local-services.schema';

@Module({
  imports: [
    JwtModule.register({
      secret: env.jwtSecret,
      signOptions: { expiresIn: '7d' },
    }),
    SupabaseModule,
    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: 'Unit', schema: unitSchema }]),
    MongooseModule.forFeature([
      { name: 'LocalService', schema: localServiceSchema },
    ]),
  ],
  controllers: [UnitController],
  providers: [UnitService, BarberShopAccessGuard],
})
export class UnitModule {}
