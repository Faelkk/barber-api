import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';

import { env } from 'src/shared/config/env';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from './modules/auth/auth-guard';

import { GlobalServiceModule } from './modules/global-service/global-service.module';
import { BarberShopModule } from './modules/barber-shop/barber-shop.module';
import { UnitModule } from './modules/unit/unit.module';
import { LocalServiceModule } from './modules/local-service/local-service.module';
import { JwtModule } from '@nestjs/jwt';
import { HolidayModule } from './modules/holiday/holiday.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppointmentModule,
    JwtModule.register({
      secret: env.jwtSecret,

      signOptions: { expiresIn: '7d', algorithm: 'HS256' },
    }),
    MongooseModule.forRoot(env.dbURL),
    UnitModule,
    GlobalServiceModule,
    LocalServiceModule,
    BarberShopModule,
    HolidayModule,
  ],
  controllers: [AppController],

  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
  ],
})
export class AppModule {}
