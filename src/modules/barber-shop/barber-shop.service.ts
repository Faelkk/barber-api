import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBarberShopDto } from './dto/create-barber-shop.dto';
import { UpdateBarberShopDto } from './dto/update-barber-shop.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BarberShop } from 'src/shared/interfaces/barber-shop.interface';
import { Unit } from 'src/shared/interfaces/unit.interface';
import { GlobalService } from 'src/shared/interfaces/global-servicce.interface';
import { LocalService } from 'src/shared/interfaces/local-service.interface';
import { Auth } from 'src/shared/interfaces/auth.interface';
import { Appointment } from 'src/shared/interfaces/appointment.interface';
import { Holiday } from 'src/shared/interfaces/holiday.interface';

@Injectable()
export class BarberShopService {
  constructor(
    @InjectModel('BarberShop') private readonly BarberModel: Model<BarberShop>,
    @InjectModel('Unit') private readonly UnitModel: Model<Unit>,
    @InjectModel('GlobalService')
    private readonly GlobalServiceModel: Model<GlobalService>,
    @InjectModel('LocalService')
    private readonly LocalServiceModel: Model<LocalService>,
    @InjectModel('Auth') private readonly AuthModel: Model<Auth>,
    @InjectModel('Appointment')
    private readonly AppointmentModel: Model<Appointment>,
    @InjectModel('Holiday')
    private readonly HolidayModel: Model<Holiday>,
  ) {}

  private async validateOwnership(barberShop: BarberShop, userId: string) {
    if (!barberShop.auth.includes(userId)) {
      throw new ConflictException(
        'You do not have permission to modify this barber shop.',
      );
    }
  }

  private async findBarberShopById(id: string): Promise<BarberShop> {
    const barberShop = await this.BarberModel.findById(id).exec();
    if (!barberShop) {
      throw new NotFoundException('Barber shop not found.');
    }
    return barberShop;
  }

  async create(
    createBarberShopDto: CreateBarberShopDto,
    avatarUrl: string,
    thumbnailUrl: string,
  ) {
    const { name, description, socialLinks } = createBarberShopDto;
    const existingBarber = await this.BarberModel.findOne({ name }).exec();

    if (existingBarber) {
      throw new ConflictException('Barber shop already exists.');
    }

    const barber = await this.BarberModel.create({
      name,
      description,
      socialLinks,
      avatar: avatarUrl,
      thumbnail: thumbnailUrl,
    });

    return { barber };
  }

  async findAll() {
    const barberShops = await this.BarberModel.find().exec();

    if (!barberShops.length) {
      throw new NotFoundException('No barber shops found.');
    }
    return { barberShops };
  }

  async findOne(id: string) {
    const barberShop = await this.BarberModel.findById(id).exec();

    if (!barberShop) {
      throw new NotFoundException('Barber shop not found.');
    }
    return { barberShop };
  }

  async update(
    id: string,
    updateBarberShopDto: UpdateBarberShopDto,
    userId: string,
    avatarUrl?: string,
    thumbnailUrl?: string,
  ) {
    const { name, description, socialLinks } = updateBarberShopDto;
    const barberShop = await this.findBarberShopById(id);

    await this.validateOwnership(barberShop, userId);

    const barbershopUpdated = await this.BarberModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        description,
        socialLinks,
        avatar: avatarUrl,
        thumbnail: thumbnailUrl,
      },
      { new: true },
    ).exec();

    return { barbershopUpdated };
  }

  async remove(id: string) {
    const barberShop = await this.BarberModel.findById(id).exec();
    if (!barberShop) {
      throw new NotFoundException(`Barbershop with ID ${id} not found`);
    }

    await Promise.all([
      this.AppointmentModel.deleteMany({
        _id: { $in: barberShop.appointments },
      }).exec(),
      this.GlobalServiceModel.deleteMany({
        _id: { $in: barberShop.globalService },
      }).exec(),
      this.LocalServiceModel.deleteMany({
        _id: { $in: barberShop.localService },
      }).exec(),
      this.UnitModel.deleteMany({ _id: { $in: barberShop.unit } }).exec(),
      this.HolidayModel.deleteMany({
        _id: { $in: barberShop.holidays },
      }).exec(),
    ]);

    await this.BarberModel.findByIdAndDelete(id).exec();

    return { message: 'Barber shop and related data successfully deleted.' };
  }
}
