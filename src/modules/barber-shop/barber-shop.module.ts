import { Module } from '@nestjs/common';
import { BarberShopService } from './barber-shop.service';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { MongooseModule } from '@nestjs/mongoose';

import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';
import { SupabaseModule } from 'src/shared/supabase/supabase.module';
import { BarberShopController } from './barber-shop.controller';
import { localServiceSchema } from 'src/shared/schemas/local-services.schema';
import { globalServiceSchema } from 'src/shared/schemas/global-service.schema';
import { HolidaySchema } from 'src/shared/schemas/holiday.schema';
import { AppointmentSchema } from 'src/shared/schemas/appointment.schema';
import { unitSchema } from 'src/shared/schemas/unit.schema';

@Module({
  imports: [
    SupabaseModule,
    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'LocalService', schema: localServiceSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'GlobalService', schema: globalServiceSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Holiday', schema: HolidaySchema }]),
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Unit', schema: unitSchema }]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
  ],
  controllers: [BarberShopController],
  providers: [BarberShopService],
})
export class BarberShopModule {}
