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
      throw new NotFoundException('Barbearia nao encontrada');
    }

    const existsHoliday = await this.Holiday.findOne({
      where: {
        barbershop: barbershop,
        date: date,
      },
    }).exec();

    if (existsHoliday) {
      throw new ConflictException('Feriado ja existe');
    }

    const holiday = await this.Holiday.create({
      barbershop,
      date,
      name,
    });

    await this.BarbershopModel.updateOne(
      { _id: barbershop },
      {
        $pull: { holiday: holiday.id },
        $push: { holiday: holiday.id },
      },
    );

    return { holiday };
  }

  async findAll(barberShopId: string) {
    const holidays = await this.Holiday.find({
      barbershop: barberShopId,
    }).exec();

    if (!holidays || holidays.length === 0) {
      throw new NotFoundException(
        'Não encontramos nenhum feriado para essa data',
      );
    }

    return { holidays };
  }

  async findOne(id: string, barberShopId) {
    const holiday = await this.Holiday.findOne({
      _id: id,
      barbershop: barberShopId,
    }).exec();

    if (!holiday) {
      throw new NotFoundException('Nao encontramos feriado para esse id');
    }

    return holiday;
  }

  async update(id: string, updateHolidayDto: UpdateHolidayDto) {
    const { barbershop, date, name } = updateHolidayDto;

    const holiday = await this.Holiday.findOne({
      _id: id,
      barbershop: barbershop,
    }).exec();

    if (!holiday) {
      throw new NotFoundException('Não foi encontrado feriado pra essa data');
    }

    if (holiday.date === date) {
      throw new ConflictException('Feriado ja existente');
    }

    const updateOneHoliday = await this.Holiday.findOneAndUpdate(
      { _id: id, barbershop: barbershop },
      { barbershop, date, name },
      { new: true },
    );

    if (!updateOneHoliday) {
      throw new InternalServerErrorException();
    }

    await this.BarbershopModel.updateOne(
      { _id: barbershop },
      {
        $pull: { holiday: holiday.id }, // Remove o feriado antigo
        $push: { holiday: updateOneHoliday.id }, // Adiciona o novo feriado
      },
    );

    return { updateOneHoliday };
  }

  async remove(id: string, barberShopId: string) {
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
