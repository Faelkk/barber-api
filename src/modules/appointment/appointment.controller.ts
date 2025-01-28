import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AppointmentService } from './services/appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ActiveUserId } from 'src/shared/decorators/activeUserId';
import { ActiveUserRole } from 'src/shared/decorators/activeUserRole';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';
import { IsPublic } from 'src/shared/decorators/isPublic';
import { SkipBarberShopIdCheck } from 'src/shared/decorators/SkipBarberShopId';
import { activeBarberShop } from 'src/shared/decorators/activeBarberShop';

@Controller('appointment')
@UseGuards(BarberShopAccessGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @IsPublic()
  @SkipBarberShopIdCheck()
  @Get('available-times/:unitId')
  async getAvailableTimes(
    @Param('unitId') unitId: string,
    @Query('date') date: string,
  ) {
    const availableTimeslots =
      await this.appointmentService.getAvailableTimeslots(unitId, date);
    return availableTimeslots;
  }

  @Post()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.create(
      createAppointmentDto,
      userId,
      userRole,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.findOne(id, userId, userRole);
  }

  @Get('/user/:id')
  findAllByUserId(
    @Param('id') id: string,
    @ActiveUserRole() userRole: string,
    @ActiveUserId() userId: string,
  ) {
    return this.appointmentService.findAllByUserId(id, userId, userRole);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
    @activeBarberShop() barberShop: string,
  ) {
    return this.appointmentService.update(
      id,
      updateAppointmentDto,
      userId,
      userRole,
      barberShop,
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.remove(id, userId, userRole);
  }
}
