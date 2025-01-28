import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Unit } from 'src/shared/interfaces/unit.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BarberShop } from 'src/shared/interfaces/barber-shop.interface';
import { Auth } from 'src/shared/interfaces/auth.interface';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { LocalService } from 'src/shared/interfaces/local-service.interface';

@Injectable()
export class UnitService {
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<Auth>,
    @InjectModel('BarberShop') private readonly barberModel: Model<BarberShop>,
    @InjectModel('Unit') private readonly unitModel: Model<Unit>,
    @InjectModel('LocalService')
    private readonly localService: Model<LocalService>,
  ) {}

  async create(
    createUnitDto: CreateUnitDto,
    avatarUrl: string,
    thumbnailUrl: string,
  ) {
    const { address, barbershop, operatingHours, phoneNumber, description } =
      createUnitDto;

    const newAddress = JSON.parse(address);

    const existingUnit = await this.unitModel
      .findOne({ 'address.cep': newAddress.cep })
      .exec();

    if (existingUnit) {
      throw new ConflictException(
        'A unit with this address (CEP) alreanpm run start:dedy exists.',
      );
    }

    const unit = await this.unitModel.create({
      address: newAddress,
      barbershop,
      operatingHours: JSON.parse(operatingHours),
      thumbnail: thumbnailUrl,
      avatar: avatarUrl,
      phoneNumber,
      description,
    });

    await this.barberModel.findByIdAndUpdate(unit, {
      $push: { unit: unit._id },
    });

    await this.localService.findByIdAndUpdate(unit, {
      $push: { unit: unit._id },
    });

    const users = await this.authModel.find({ barbershop }).exec();

    await this.unitModel.findByIdAndUpdate(
      unit._id,
      { $push: { auth: { $each: users.map((user) => user._id) } } },
      { new: true },
    );

    return { unit };
  }

  async findAll(barberShopId: string) {
    const units = await this.unitModel
      .find({ barbershop: barberShopId })
      .populate({
        path: 'auth',
        model: 'Auth',
        select: 'name description role thumbnail email avatar',
        match: { role: 'Barber' },
      })
      .populate({
        path: 'localService',
        model: 'LocalService',
        select: 'name price description duration type barbershop barbers',
      })
      .exec();

    if (!units) {
      throw new NotFoundException('Not found any units for this barber shop');
    }

    return { units };
  }

  async findOne(id: string, barberShopId: string) {
    const unit = await this.unitModel
      .findById({ _id: id, barbershop: barberShopId })
      .populate({
        path: 'auth',
        model: 'Auth',
        select: 'id name email role description thumbnail email avatar',
        match: { role: 'Barber' },
      })
      .populate({
        path: 'localService',
        model: 'LocalService',
        select: 'name price description duration type barbershop barbers',
      })
      .exec();

    if (!unit) {
      throw new NotFoundException('Unit not found.');
    }

    return { unit };
  }

  async update(
    id: string,
    updateUnitDto: UpdateUnitDto,
    avatarUrl?: string,
    thumbnailUrl?: string,
  ) {
    const { address, operatingHours, phoneNumber, description } = updateUnitDto;

    const existingUnit = await this.unitModel.findById(id).exec();

    if (!existingUnit) {
      throw new NotFoundException('Unit not found.');
    }

    const newAddress = JSON.parse(address);

    if (id !== existingUnit.id) {
      const existingAddress = await this.unitModel
        .findOne({ 'address.cep': newAddress.cep })
        .exec();

      if (existingAddress) {
        throw new ConflictException(
          'A unit with this address (CEP) already exists.',
        );
      }
    }

    const oldUnit = existingUnit.barbershop;

    const unitEdited = await this.unitModel.findOneAndUpdate(
      { _id: id },
      {
        address: newAddress,
        operatingHours: JSON.parse(operatingHours),
        barbershop: oldUnit,
        avatar: avatarUrl,
        thumbnail: thumbnailUrl,
        phoneNumber,
        description,
      },
      { new: true },
    );

    if (oldUnit !== unitEdited.barbershop) {
      await this.barberModel.findByIdAndUpdate(oldUnit, {
        $pull: { unit: unitEdited.id },
      });

      await this.localService.findByIdAndUpdate(oldUnit, {
        $push: { unit: unitEdited._id },
      });

      await this.unitModel.findByIdAndUpdate(oldUnit, {
        $push: { auth: unitEdited.id },
      });
    }

    return {
      message: 'unit updated successfully',
      unit: unitEdited,
    };
  }

  async remove(id: string, barberShopId: string) {
    const deletedUnit = await this.unitModel
      .findOneAndDelete({ _id: id, barbershop: barberShopId })
      .exec();

    if (!deletedUnit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
    await this.barberModel.findByIdAndUpdate(barberShopId, {
      $pull: { unit: deletedUnit.id },
    });

    return { message: 'unity successfully deleted.' };
  }
}
