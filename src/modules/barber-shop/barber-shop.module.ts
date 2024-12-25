import { Module } from '@nestjs/common';
import { BarberShopService } from './barber-shop.service';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { MongooseModule } from '@nestjs/mongoose';

import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';
import { SupabaseModule } from 'src/shared/supabase/supabase.module';
import { BarberShopController } from './barber-shop.controller';

@Module({
  imports: [
    SupabaseModule,
    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
  ],
  controllers: [BarberShopController],
  providers: [BarberShopService],
})
export class BarberShopModule {}
