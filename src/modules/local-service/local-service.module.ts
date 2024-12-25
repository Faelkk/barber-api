import { Module } from '@nestjs/common';
import { LocalServiceService } from './local-service.service';
import { LocalServiceController } from './local-service.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { unitSchema } from 'src/shared/schemas/unit.schema';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';
import { localServiceSchema } from 'src/shared/schemas/local-services.schema';
import { SupabaseModule } from 'src/shared/supabase/supabase.module';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Unit', schema: unitSchema }]),
    MongooseModule.forFeature([
      { name: 'LocalService', schema: localServiceSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
    SupabaseModule,
  ],
  controllers: [LocalServiceController],
  providers: [LocalServiceService, BarberShopAccessGuard],
})
export class LocalServiceModule {}
