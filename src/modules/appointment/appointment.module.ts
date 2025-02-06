import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentService } from './services/appointment.service';
import { AppointmentController } from './appointment.controller';
import { AppointmentSchema } from 'src/shared/schemas/appointment.schema';
import { AuthModule } from '../auth/auth.module';
import { RolesGuardModule } from '../roles/roles-guard.module';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { unitSchema } from 'src/shared/schemas/unit.schema';
import { globalServiceSchema } from 'src/shared/schemas/global-service.schema';
import { localServiceSchema } from 'src/shared/schemas/local-services.schema';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';
import { AppointmentValidationService } from './services/validation-appointment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Appointment', schema: AppointmentSchema },
    ]),
    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([{ name: 'Unit', schema: unitSchema }]),
    MongooseModule.forFeature([
      { name: 'GlobalService', schema: globalServiceSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'LocalService', schema: localServiceSchema },
    ]),
    MongooseModule.forFeature([
      { name: 'LocalService', schema: localServiceSchema },
    ]),
    MongooseModule.forFeature([{ name: 'AuthModel', schema: AuthSchema }]),
    AuthModule,
    RolesGuardModule,
  ],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    AppointmentValidationService,
    BarberShopAccessGuard,
  ],
})
export class AppointmentModule {}
