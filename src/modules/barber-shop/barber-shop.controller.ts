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
  UseGuards,
} from '@nestjs/common';

import { CreateBarberShopDto } from './dto/create-barber-shop.dto';
import { UpdateBarberShopDto } from './dto/update-barber-shop.dto';
import { BarberShopService } from './barber-shop.service';
import { Role, Roles } from 'src/shared/decorators/isRoles';
import { ActiveUserId } from 'src/shared/decorators/activeUserId';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IsPublic } from 'src/shared/decorators/isPublic';
import { SupabaseService } from 'src/shared/supabase/supabase.service';
import { RolesGuard } from '../roles/roles.guard';

@Controller('barber-shop')
@UseGuards(RolesGuard)
export class BarberShopController {
  constructor(
    private readonly barberShopService: BarberShopService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post('')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @Roles(Role.Developer)
  async create(
    @Body() createBarberShopDto: CreateBarberShopDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = await this.supabaseService.uploadFile(
      'barbershop',
      files.avatar[0],
    );
    const thumbnailUrl = await this.supabaseService.uploadFile(
      'barbershop',
      files.thumbnail[0],
    );

    return this.barberShopService.create(
      createBarberShopDto,
      avatarUrl,
      thumbnailUrl,
    );
  }

  @IsPublic()
  @Get()
  findAll() {
    return this.barberShopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.barberShopService.findOne(id);
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  @Roles(Role.Developer)
  async update(
    @Param('id') id: string,
    @Body() updateBarberShopDto: UpdateBarberShopDto,
    @ActiveUserId() userId: string,
    @UploadedFiles()
    files?: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = (await files?.avatar)
      ? await this.supabaseService.uploadFile('barbershop', files.avatar[0])
      : undefined;

    const thumbnailUrl = files?.thumbnail
      ? await this.supabaseService.uploadFile('barbershop', files.thumbnail[0])
      : undefined;

    return this.barberShopService.update(
      id,
      updateBarberShopDto,
      userId,
      avatarUrl,
      thumbnailUrl,
    );
  }

  @Delete(':id')
  @Roles(Role.Developer)
  remove(@Param('id') id: string) {
    return this.barberShopService.remove(id);
  }
}
