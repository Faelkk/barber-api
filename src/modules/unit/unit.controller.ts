import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UnitService } from './unit.service';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/shared/supabase/supabase.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { Role, Roles } from 'src/shared/decorators/isRoles';
import { RolesGuard } from '../roles/roles.guard';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';
import { IsPublic } from 'src/shared/decorators/isPublic';
import { SkipBarberShopIdCheck } from 'src/shared/decorators/SkipBarberShopId';

@Controller('unit')
@UseGuards(RolesGuard)
@UseGuards(BarberShopAccessGuard)
export class UnitController {
  constructor(
    private readonly unitService: UnitService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @Roles(Role.Admin, Role.Developer)
  async create(
    @Body() createUnitDto: CreateUnitDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = await this.supabaseService.uploadFile(
      'unit',
      files.avatar[0],
    );
    const thumbnailUrl = await this.supabaseService.uploadFile(
      'unit',
      files.thumbnail[0],
    );

    return this.unitService.create(createUnitDto, avatarUrl, thumbnailUrl);
  }

  @IsPublic()
  @SkipBarberShopIdCheck()
  @Get()
  findAll(@Query('barberShopId') barberShopId: string) {
    return this.unitService.findAll(barberShopId);
  }

  @IsPublic()
  @SkipBarberShopIdCheck()
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('barberShopId') barberShopId: string,
  ) {
    return this.unitService.findOne(id, barberShopId);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @Roles(Role.Admin, Role.Developer)
  async update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = await this.supabaseService.uploadFile(
      'unit',
      files.avatar[0],
    );
    const thumbnailUrl = await this.supabaseService.uploadFile(
      'unit',
      files.thumbnail[0],
    );

    return this.unitService.update(id, updateUnitDto, avatarUrl, thumbnailUrl);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Developer)
  remove(@Param('id') id: string, @Query('barberShopId') barberShopId: string) {
    return this.unitService.remove(id, barberShopId);
  }
}
