import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateLocalServiceDto } from './dto/create-local-service.dto';
import { UpdateLocalServiceDto } from './dto/update-local-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from 'src/shared/interfaces/unit.interface';
import { LocalService } from 'src/shared/interfaces/local-service.interface';
import { Auth } from 'src/shared/interfaces/auth.interface';
import { BarberShop } from 'src/shared/interfaces/barber-shop.interface';

@Injectable()
export class LocalServiceService {
  constructor(
    @InjectModel('LocalService')
    private readonly localServiceModel: Model<LocalService>,
    @InjectModel('Unit')
    private readonly unitModel: Model<Unit>,
    @InjectModel('Auth')
    private readonly AuthModel: Model<Auth>,
    @InjectModel('BarberShop')
    private readonly barbershopModel: Model<BarberShop>,
  ) {}

  async create(
    createLocalServiceDto: CreateLocalServiceDto,
    avatarUrl: string,
    thumbnailUrl: string,
    userId: string,
    userRole: string,
  ) {
    const {
      name,
      price,
      barbershop,
      duration,
      unit,
      description,
      barbers,
      type,
    } = createLocalServiceDto;

    const existingBarbershop = await this.barbershopModel
      .findById(barbershop)
      .exec();
    if (!existingBarbershop) {
      throw new NotFoundException('Barbershop not found');
    }

    const existingUnit = await this.unitModel.findById(unit).exec();
    if (!existingUnit) {
      throw new NotFoundException('Unit not found');
    }

    const barbersArray = Array.isArray(barbers) ? barbers : [barbers];

    const validBarbers = await this.AuthModel.find({
      _id: barbersArray,
    }).exec();

    const invalidBarbers = barbersArray.filter(
      (barberId) =>
        !validBarbers.some(
          (validBarber) => validBarber._id.toString() === barberId,
        ),
    );

    if (invalidBarbers.length > 0) {
      throw new Error('Some barbers are invalid or do not exist');
    }

    await this.validatePermission(userRole, userId, barbers);

    const existingService = await this.localServiceModel
      .findOne({ name, barbershop, unit })
      .exec();

    if (existingService) {
      throw new ConflictException('Local service already exists');
    }

    const localService = await this.localServiceModel.create({
      name,
      price,
      barbershop,
      duration,
      description,
      barbers: validBarbers.map((barber) => barber._id),
      type,
      unit,
      avatar: avatarUrl,
      thumbnail: thumbnailUrl,
    });

    await this.unitModel.findByIdAndUpdate(unit, {
      $push: { localService: localService.id },
    });

    return { localService };
  }

  async findAll(barbershopId: string, unitId: string) {
    const services = await this.localServiceModel
      .find({ barbershop: barbershopId, unit: unitId })
      .exec();

    if (!services || services.length === 0) {
      throw new NotFoundException(
        'No services found for the specified barbershop and unit',
      );
    }

    return services;
  }

  async findOne(id: string, barbershopId: string, unitId: string) {
    const service = await this.localServiceModel
      .findOne({ _id: id, barbershop: barbershopId, unit: unitId })
      .exec();

    if (!service) {
      throw new NotFoundException('Local service not found');
    }

    return service;
  }

  async update(
    id: string,
    updateLocalServiceDto: UpdateLocalServiceDto,
    avatarUrl: string,
    thumbnailUrl: string,
    userRole: string,
    userId: string,
  ) {
    const { name, price, description, duration, barbers, barbershop, unit } =
      updateLocalServiceDto;

    const existingService = await this.localServiceModel
      .findOne({ _id: id, barbershop, unit })
      .exec();

    if (!existingService) {
      throw new NotFoundException('Local service not found');
    }

    const existingUnit = await this.unitModel.findById(unit).exec();
    if (!existingUnit) {
      throw new NotFoundException('Unit not found');
    }

    const barbersArray = Array.isArray(barbers) ? barbers : [barbers];

    const validBarbers = await this.AuthModel.find({
      _id: barbersArray,
    }).exec();

    const invalidBarbers = barbersArray.filter(
      (barberId) =>
        !validBarbers.some(
          (validBarber) => validBarber._id.toString() === barberId,
        ),
    );

    if (invalidBarbers.length > 0) {
      throw new Error('Some barbers are invalid or do not exist');
    }

    await this.validatePermission(userRole, userId, barbers);

    const oldService = existingService.barbershop;

    const localServiceEdited = await this.localServiceModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        description,
        price,
        duration,
        barbers,
        barbershop: oldService,
        avatar: avatarUrl,
        thumbnail: thumbnailUrl,
      },
      { new: true },
    );

    if (oldService !== localServiceEdited.barbershop) {
      await this.unitModel.findByIdAndUpdate(localServiceEdited.unit, {
        $push: { localService: localServiceEdited.id },
      });

      await this.localServiceModel.findByIdAndUpdate(
        localServiceEdited.barbershop,
        {
          $push: { auth: localServiceEdited.id },
        },
      );

      return {
        message: 'Local service updated successfully',
        localService: existingService,
      };
    }
  }

  async remove(id: string, barbershopId: string, unitId: string) {
    const deletedService = await this.localServiceModel
      .findOneAndDelete({ _id: id, barbershop: barbershopId, unit: unitId })
      .exec();

    if (!deletedService) {
      throw new NotFoundException(`Local Service with ID ${id} not found`);
    }

    await this.unitModel.findByIdAndUpdate(barbershopId, {
      $pull: { services: deletedService.id },
    });

    return { message: 'Local service removed successfully' };
  }

  async removeOneBarberIdFromService(
    id: string,
    barberId: string,
    barbershopId: string,
    unitId: string,
    userRole: string,
    userId: string,
  ) {
    const barber = await this.AuthModel.findOne({
      id: barberId,
    }).exec();

    if (!barber) {
      throw new NotFoundException('Barber not found');
    }

    await this.validatePermission(userRole, userId, barberId);

    const service = await this.localServiceModel
      .findOne({ _id: id, barbershop: barbershopId, unit: unitId })
      .exec();

    if (!service) {
      throw new NotFoundException(`Local service with ID ${id} not found`);
    }

    if (service.barbers.length === 1) {
      await this.localServiceModel.findByIdAndDelete(id);
      await this.unitModel.findByIdAndUpdate(unitId, {
        $pull: { services: id },
      });

      return { message: 'Service deleted as the only barber was removed' };
    }

    const updatedService = await this.localServiceModel.findByIdAndUpdate(
      id,
      {
        $pull: { barbers: barberId },
      },
      { new: true },
    );

    return {
      message: 'Barber removed from service successfully',
      updatedService,
    };
  }

  async validatePermission(
    userRole: string,
    userId: string,
    barberId: string[] | string,
  ) {
    if (userRole === 'Admin' || userRole === 'Developer') return;

    if (Array.isArray(barberId)) {
      if (!barberId.includes(userId)) {
        throw new ForbiddenException(
          'You do not have permission to perform this action',
        );
      }
    } else if (barberId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }
  }
}
