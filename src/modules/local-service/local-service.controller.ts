import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { LocalServiceService } from './local-service.service';
import { CreateLocalServiceDto } from './dto/create-local-service.dto';
import { UpdateLocalServiceDto } from './dto/update-local-service.dto';
import { Role, Roles } from 'src/shared/decorators/isRoles';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { SupabaseService } from 'src/shared/supabase/supabase.service';
import { RolesGuard } from '../roles/roles.guard';
import { BarberShopAccessGuard } from 'src/shared/guards/barber-shop/barber-shop-guard';
import { ActiveUserId } from 'src/shared/decorators/activeUserId';
import { ActiveUserRole } from 'src/shared/decorators/activeUserRole';
import { ApiBody } from '@nestjs/swagger';

@Controller('local-service')
@UseGuards(RolesGuard)
@UseGuards(BarberShopAccessGuard)
export class LocalServiceController {
  constructor(
    private readonly localServiceService: LocalServiceService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Post()
  @ApiBody({ type: CreateLocalServiceDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  @Roles(Role.Barber, Role.Admin, Role.Developer)
  async create(
    @Body() createLocalServiceDto: CreateLocalServiceDto,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = (await files?.avatar)
      ? await this.supabaseService.uploadFile('local-service', files.avatar[0])
      : undefined;

    const thumbnailUrl = files?.thumbnail
      ? await this.supabaseService.uploadFile(
          'local-service',
          files.thumbnail[0],
        )
      : undefined;

    return this.localServiceService.create(
      createLocalServiceDto,
      avatarUrl,
      thumbnailUrl,
      userId,
      userRole,
    );
  }

  @Get()
  findAllByUnityId(
    @Query('barberShopId') barberShopId: string,
    @Query('unityId') unityId: string,
  ) {
    return this.localServiceService.findAll(barberShopId, unityId);
  }

  @Get(':id')
  findOneByUnityId(
    @Param('id') id: string,
    @Query('barberShopId') barberShopId: string,
    @Query('unityId') unityId: string,
  ) {
    return this.localServiceService.findOne(id, barberShopId, unityId);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateLocalServiceDto })
  @Roles(Role.Barber, Role.Admin, Role.Developer)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() updateLocalServiceDto: UpdateLocalServiceDto,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
    @UploadedFiles()
    files: {
      avatar?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
    },
  ) {
    const avatarUrl = (await files?.avatar)
      ? await this.supabaseService.uploadFile('local-service', files.avatar[0])
      : undefined;

    const thumbnailUrl = files?.thumbnail
      ? await this.supabaseService.uploadFile(
          'local-service',
          files.thumbnail[0],
        )
      : undefined;

    return this.localServiceService.update(
      id,
      updateLocalServiceDto,
      avatarUrl,
      thumbnailUrl,
      userId,
      userRole,
    );
  }

  @Delete(':id')
  @Roles(Role.Barber, Role.Admin, Role.Developer)
  remove(
    @Param('id') id: string,
    @Query('barberShopId') barberShopId: string,
    @Query('unityId') unityId: string,
  ) {
    return this.localServiceService.remove(id, barberShopId, unityId);
  }

  @Delete(':id/:barberId')
  @Roles(Role.Barber, Role.Admin, Role.Developer)
  removeOneBarberIdFromService(
    @Param('id') id: string,
    @Param('barberId') barberId: string,
    @Query('barberShopId') barberShopId: string,
    @Query('unityId') unityId: string,
    @ActiveUserId() userId: string,
    @ActiveUserRole() userRole: string,
  ) {
    return this.localServiceService.removeOneBarberIdFromService(
      id,
      barberId,
      barberShopId,
      unityId,
      userId,
      userRole,
    );
  }
}
