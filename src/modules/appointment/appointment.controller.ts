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

@Controller('appointment')
@UseGuards(BarberShopAccessGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

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
    @Query('barber') barberId?: string,
    @Query('client') clientId?: string,
  ) {
    return this.appointmentService.findOne(id, barberId, clientId);
  }

  @Get('/user/:id')
  findAllByUserId(
    @Param('id') id: string,
    @Query() userRole: string,
    @ActiveUserId() userId: string,
  ) {
    return this.appointmentService.findAllByUserId(id, userId, userRole);
  }

  @Get('client/:clientId')
  findAllByClientId(
    @Param('clientId') clientId: string,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.findAllByClientId(
      userId,
      userRole,
      clientId,
    );
  }

  @Get('barber/:barberId')
  findAllByBarberId(
    @Param('barberId') barberId: string,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.findAllByBarberId(
      userId,
      userRole,
      barberId,
    );
  }

  @Get('unit/:unitId')
  findAllByUnitId(
    @Param('unitId') unitId: string,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.findAllByUnitId(userId, userRole, unitId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.appointmentService.update(
      id,
      updateAppointmentDto,
      userId,
      userRole,
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
