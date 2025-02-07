import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Role, Roles } from 'src/shared/decorators/isRoles';

@Controller('holiday')
@UseGuards(RolesGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Post()
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  @ApiBody({ type: CreateHolidayDto })
  create(@Body() createHolidayDto: CreateHolidayDto) {
    return this.holidayService.create(createHolidayDto);
  }

  @Get()
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  findAll(@Query('barberShopId') barberShopId: string) {
    return this.holidayService.findAll(barberShopId);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  findOne(
    @Param('id') id: string,
    @Query('barberShopId') barberShopId: string,
  ) {
    return this.holidayService.findOne(id, barberShopId);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateHolidayDto })
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  update(@Param('id') id: string, @Body() updateHolidayDto: UpdateHolidayDto) {
    return this.holidayService.update(id, updateHolidayDto);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  remove(@Param('id') id: string, @Query('barberShopId') barberShopId: string) {
    return this.holidayService.remove(id, barberShopId);
  }
}
