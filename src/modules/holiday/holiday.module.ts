import { Module } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { HolidayController } from './holiday.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { HolidaySchema } from 'src/shared/schemas/holiday.schema';
import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Holiday', schema: HolidaySchema }]),

    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
  ],
  controllers: [HolidayController],
  providers: [HolidayService],
})
export class HolidayModule {}
