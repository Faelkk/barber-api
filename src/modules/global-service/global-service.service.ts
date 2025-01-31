import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGlobalServiceDto } from './dto/create-global-service.dto';
import { UpdateGlobalServiceDto } from './dto/update-global-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from 'src/shared/interfaces/auth.interface';
import { BarberShop } from 'src/shared/interfaces/barber-shop.interface';
import { GlobalService } from 'src/shared/interfaces/global-servicce.interface';

@Injectable()
export class GlobalServiceService {
  constructor(
    @InjectModel('GlobalService')
    private readonly globalServiceModel: Model<GlobalService>,

    @InjectModel('Auth')
    private readonly AuthModel: Model<Auth>,
    @InjectModel('BarberShop')
    private readonly barbershopModel: Model<BarberShop>,
  ) {}

  async create(
    createGlobalServiceDto: CreateGlobalServiceDto,
    avatarUrl: string,
    thumbnailUrl: string,
  ) {
    const { name, price, barbershop, duration, description, type } =
      createGlobalServiceDto;

    const existingBarbershop = await this.barbershopModel
      .findById(barbershop)
      .exec();
    if (!existingBarbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const existingService = await this.globalServiceModel
      .findOne({ name, barbershop })
      .exec();

    if (existingService) {
      throw new ConflictException('global service already exists');
    }

    const globalService = await this.globalServiceModel.create({
      name,
      price,
      barbershop,
      duration,
      description,
      type,
      avatar: avatarUrl,
      thumbnail: thumbnailUrl,
    });

    await this.barbershopModel.findByIdAndUpdate(barbershop, {
      $push: { services: globalService.id },
    });

    return { globalService };
  }

  async findAll(barbershopId: string) {
    const services = await this.globalServiceModel
      .find({ barbershop: barbershopId })
      .exec();

    if (!services || services.length === 0) {
      throw new NotFoundException('No services found for global service');
    }

    return services;
  }

  async findOne(id: string, barbershopId: string) {
    const service = await this.globalServiceModel
      .findOne({ _id: id, barbershop: barbershopId })
      .exec();

    if (!service) {
      throw new NotFoundException('global service not found');
    }

    return service;
  }

  async update(
    id: string,
    updateGlobalServiceDto: UpdateGlobalServiceDto,
    avatarUrl: string,
    thumbnailUrl: string,
  ) {
    const { name, price, description, duration, barbershop } =
      updateGlobalServiceDto;

    const existingService = await this.globalServiceModel
      .findOne({ _id: id, barbershop })
      .exec();

    if (!existingService) {
      throw new NotFoundException('Local service not found');
    }

    const oldService = existingService.barbershop;

    const globalServiceEdited = await this.globalServiceModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        description,
        price,
        duration,
        barbershop: oldService,
        avatar: avatarUrl,
        thumbnail: thumbnailUrl,
      },
      { new: true },
    );

    if (oldService !== globalServiceEdited.barbershop) {
      await this.barbershopModel.findByIdAndUpdate(oldService, {
        $pull: { globalService: globalServiceEdited.id },
      });

      await this.globalServiceModel.findByIdAndUpdate(
        globalServiceEdited.barbershop,
        {
          $push: { auth: globalServiceEdited.id },
        },
      );
    }

    return {
      message: 'Global service updated successfully',
      globalService: globalServiceEdited,
    };
  }

  async remove(id: string, barbershopId: string) {
    const deletedService = await this.globalServiceModel
      .findOneAndDelete({ _id: id, barbershop: barbershopId })
      .exec();

    if (!deletedService) {
      throw new NotFoundException(`Global Service with ID ${id} not found`);
    }

    await this.barbershopModel.findByIdAndUpdate(barbershopId, {
      $pull: { globalService: deletedService.id },
    });

    return { message: 'global service removed successfully' };
  }
}
