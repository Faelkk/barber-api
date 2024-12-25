import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { GlobalServiceService } from './global-service.service';
import { CreateGlobalServiceDto } from './dto/create-global-service.dto';
import { UpdateGlobalServiceDto } from './dto/update-global-service.dto';
import { Role, Roles } from 'src/shared/decorators/isRoles';
import { SupabaseService } from 'src/shared/supabase/supabase.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../roles/roles.guard';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';
import { SkipBarberShopIdCheck } from 'src/shared/decorators/SkipBarberShopId';
import { IsPublic } from 'src/shared/decorators/isPublic';

@Controller('global-service')
@UseGuards(RolesGuard)
@UseGuards(BarberShopAccessGuard)
export class GlobalServiceController {
  constructor(
    private readonly globalServiceService: GlobalServiceService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @IsPublic()
  @SkipBarberShopIdCheck()
  @Get()
  findAll(@Query('barberShopId') barberShopId: string) {
    return this.globalServiceService.findAll(barberShopId);
  }

  @Post()
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createGlobalServiceDto: CreateGlobalServiceDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = (await files?.avatar)
      ? await this.supabaseService.uploadFile('global-service', files.avatar[0])
      : undefined;

    const thumbnailUrl = files?.thumbnail
      ? await this.supabaseService.uploadFile(
          'global-service',
          files.thumbnail[0],
        )
      : undefined;

    return this.globalServiceService.create(
      createGlobalServiceDto,
      avatarUrl,
      thumbnailUrl,
    );
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('barberShopId') barberShopId: string,
  ) {
    return this.globalServiceService.findOne(id, barberShopId);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Barber, Role.Developer)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateGlobalServiceDto: UpdateGlobalServiceDto,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = (await files?.avatar)
      ? await this.supabaseService.uploadFile('global-service', files.avatar[0])
      : undefined;

    const thumbnailUrl = files?.thumbnail
      ? await this.supabaseService.uploadFile(
          'global-service',
          files.thumbnail[0],
        )
      : undefined;

    return this.globalServiceService.update(
      id,
      updateGlobalServiceDto,
      avatarUrl,
      thumbnailUrl,
    );
  }

  @Roles(Role.Admin, Role.Barber, Role.Developer)
  @Delete(':id')
  remove(@Param('id') id: string, @Query('barberShopId') barberShopId: string) {
    return this.globalServiceService.remove(id, barberShopId);
  }
}
