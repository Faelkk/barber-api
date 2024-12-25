import { Module } from '@nestjs/common';
import { GlobalServiceService } from './global-service.service';
import { GlobalServiceController } from './global-service.controller';

import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';
import { globalServiceSchema } from 'src/shared/schemas/global-service.schema';
import { SupabaseModule } from 'src/shared/supabase/supabase.module';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'GlobalService', schema: globalServiceSchema },
    ]),
    SupabaseModule,
  ],
  controllers: [GlobalServiceController],
  providers: [GlobalServiceService, BarberShopAccessGuard],
})
export class GlobalServiceModule {}
