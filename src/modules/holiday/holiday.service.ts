import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Holiday } from 'src/shared/interfaces/holiday.interface';
import { Model } from 'mongoose';
import { BarberShop } from 'src/shared/interfaces/barber-shop.interface';

@Injectable()
export class HolidayService {
  constructor(
    @InjectModel('Holiday')
    private readonly Holiday: Model<Holiday>,

    @InjectModel('BarberShop')
    private readonly BarbershopModel: Model<BarberShop>,
  ) {}

  async create(createHolidayDto: CreateHolidayDto) {
    const { barbershop, date, name } = createHolidayDto;

    const existsBarberShop = await this.BarbershopModel.findById(barbershop);

    if (!existsBarberShop) {
      throw new NotFoundException();
    }

    const existsHoliday = await this.Holiday.find({
      where: {
        date: date,
      },
    }).exec();

    if (existsHoliday) {
      throw new ConflictException();
    }

    const holiday = await this.Holiday.create({
      barbershop,
      date,
      name,
    });

    await this.BarbershopModel.findByIdAndUpdate(barbershop, {
      $push: { holiday: holiday.id },
    });

    return { holiday };
  }

  async findAll(barberShopId: string) {
    const holidays = await this.Holiday.find({
      barbershop: barberShopId,
    }).exec();

    if (!holidays || holidays.length === 0) {
      throw new NotFoundException();
    }

    return { holidays };
  }

  async findOne(id: number, barberShopId) {
    const holiday = await this.Holiday.findOne({
      _id: id,
      barbershop: barberShopId,
    }).exec();

    if (!holiday) {
      throw new NotFoundException();
    }

    return { holiday };
  }

  async update(
    id: number,
    barberShopId: string,
    updateHolidayDto: UpdateHolidayDto,
  ) {
    const { barbershop, date, name } = updateHolidayDto;

    const holiday = await this.Holiday.findOne({
      _id: id,
      barbershop: barberShopId,
    }).exec();

    if (!holiday) {
      throw new NotFoundException();
    }

    if (holiday.date === date) {
      throw new ConflictException();
    }

    const updateOneHoliday = await this.Holiday.findOneAndUpdate(
      { _id: id, barbershop: barberShopId },
      { barbershop, date, name },
      { new: true },
    );

    if (!updateOneHoliday) {
      throw new InternalServerErrorException();
    }

    await this.BarbershopModel.findByIdAndUpdate(barbershop, {
      $push: { holiday: updateOneHoliday.id },
    });

    return { updateOneHoliday };
  }

  async remove(id: number, barberShopId: string) {
    const holiday = await this.Holiday.findOne({
      _id: id,
      barbershop: barberShopId,
    }).exec();

    if (!holiday) {
      throw new NotFoundException();
    }

    await holiday.deleteOne();

    return { deleted: true };
  }
}
