import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Auth } from 'src/shared/interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from '../dto/create-auth.dto';
import { UpdateAuthDto } from '../dto/update-auth.dto';
import { LoginUserDto } from '../dto/login-auth-dto';
import { hash, compare } from 'bcryptjs';
import { BarberShop } from 'src/shared/interfaces/barber-shop.interface';
import { Unit } from 'src/shared/interfaces/unit.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<Auth>,
    @InjectModel('BarberShop') private readonly barberModel: Model<BarberShop>,
    @InjectModel('Unit') private readonly unitModel: Model<Unit>,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(createAuthDto: CreateAuthDto) {
    const { name, email, password, phoneNumber, barbershop } = createAuthDto;

    await this.validateBarbershop(barbershop);

    await this.checkExistingUser(email);

    const hashedPassword = await hash(password, 12);

    const user = await this.authModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'Client',
      phoneNumber,
      barbershop,
    });

    if (!user) {
      throw new InternalServerErrorException('User creation failed');
    }
    await this.barberModel.findByIdAndUpdate(barbershop, {
      $push: { auth: user.id },
    });

    const accessToken = await this.generateAccessToken(
      user.id,
      user.role,
      user.barbershop,
    );

    return { accessToken, barbershop: user.barbershop };
  }

  async createUserWithRole(
    createAuthDto: CreateAuthDto,
    role: string,
    avatarUrl?: string,
    thumbnailUrl?: string,
  ) {
    const {
      name,
      email,
      password,
      phoneNumber,
      description,
      barbershop,
      units,
    } = createAuthDto;

    await this.validateBarbershop(barbershop);

    await this.checkExistingUser(email);

    const hashedPassword = await hash(password, 12);

    let relatedUnits;

    if (role === 'Barber') {
      relatedUnits = units?.length
        ? units
        : await this.getAllUnitsFromBarbershop(barbershop);
    }

    const user = await this.authModel.create({
      email,
      name,
      password: hashedPassword,
      phoneNumber,
      description,
      avatar: avatarUrl,
      thumbnail: thumbnailUrl,
      role,
      barbershop,
      units: relatedUnits,
    });

    if (!user) {
      throw new InternalServerErrorException();
    }

    await this.barberModel.findByIdAndUpdate(barbershop, {
      $push: { auth: user.id },
    });

    if (user.role === 'Barber') {
      await this.unitModel.findByIdAndUpdate(units, {
        $push: { auth: user.id },
      });
    }

    const accessToken = await this.generateAccessToken(
      user.id,
      user.role,
      user.barbershop,
    );

    return { accessToken, barbershop: user.barbershop };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password, barbershop } = loginUserDto;
    const user = await this.authModel.findOne({ email, barbershop }).exec();

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.generateAccessToken(
      user.id,
      user.role,
      user.barbershop,
    );

    return { accessToken, barbershop: user.barbershop };
  }

  private async validateBarbershop(barbershop: string) {
    const barbershopExists = await this.barberModel.findById(barbershop);
    if (!barbershopExists) {
      throw new Error('Barbershop not found');
    }
  }

  private async checkExistingUser(email: string) {
    const existingUser = await this.authModel.findOne({ email }).exec();
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
  }

  private generateAccessToken(
    userId: string,
    role: string,
    barbershop: string,
  ) {
    return this.jwtService.signAsync({ sub: userId, role, barbershop });
  }

  async findAll(barberShopId: string) {
    const users = await this.authModel
      .find({ barbershop: barberShopId })
      .select(
        'name email phoneNumber role barbershop avatar description thumbnail services unit',
      )
      .exec();

    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }

    return { users };
  }

  async findOne(id: string, barberShopId: string) {
    const user = await this.authModel
      .findOne({ _id: id, barbershop: barberShopId })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }
  async findMe(userId: string, barberShop: string) {
    const user = await this.authModel
      .findOne({ _id: userId, barbershop: barberShop })
      .select('name email role phoneNumber appointments barbershop')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { user };
  }

  async updateUser(id: string, updateAuthDto: UpdateAuthDto) {
    const { name, email, password, phoneNumber } = updateAuthDto;

    const user = await this.authModel.findById(id).exec();
    if (!user || user.role !== 'Client') {
      throw new NotFoundException('User not found or invalid role');
    }

    const oldBarbershop = user.barbershop;

    const hashedPassword = await hash(password, 12);

    const userEdited = await this.authModel.findOneAndUpdate(
      { _id: id },
      { name, email, password: hashedPassword, phoneNumber },
      { new: true },
    );

    if (oldBarbershop !== userEdited.barbershop) {
      await this.barberModel.findByIdAndUpdate(oldBarbershop, {
        $pull: { auth: user.id },
      });

      await this.barberModel.findByIdAndUpdate(userEdited.barbershop, {
        $push: { auth: userEdited.id },
      });
    }

    return { userEdited };
  }

  async updateBarber(
    id: string,
    updateAuthDto: UpdateAuthDto,
    avatarUrl?: string,
    thumbnailUrl?: string,
  ) {
    const { name, email, password, phoneNumber, description } = updateAuthDto;
    const user = await this.authModel.findById(id).exec();

    if (!user || user.role !== 'Barber') {
      throw new NotFoundException('Barber not found or invalid role');
    }

    const oldBarbershop = user.barbershop;

    const hashedPassword = await hash(password, 12);

    const barberEdited = await this.authModel.findOneAndUpdate(
      { _id: id },
      {
        email,
        name,
        description,
        password: hashedPassword,
        phoneNumber,
        barbershop: user.barbershop,
        avatar: avatarUrl,
        thumbnail: thumbnailUrl,
      },
      { new: true },
    );

    if (oldBarbershop !== barberEdited.barbershop) {
      await this.barberModel.findByIdAndUpdate(oldBarbershop, {
        $pull: { auth: user.id },
      });

      await this.barberModel.findByIdAndUpdate(barberEdited.barbershop, {
        $push: { auth: barberEdited.id },
      });
    }

    return { barberEdited };
  }

  async updateAdmin(
    id: string,
    updateAuthDto: UpdateAuthDto,
    avatarUrl?: string,
    thumbnailUrl?: string,
  ) {
    const { name, email, password, phoneNumber, description, role } =
      updateAuthDto;
    const user = await this.authModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('Admin not found or invalid role');
    }

    const oldBarbershop = user.barbershop;

    const hashedPassword = await hash(password, 12);

    const userEdited = await this.authModel.findOneAndUpdate(
      { _id: id },
      {
        email,
        name,
        description,
        password: hashedPassword,
        phoneNumber,
        barbershop: user.barbershop,
        avatar: avatarUrl,
        thumbnail: thumbnailUrl,
        role,
      },
      { new: true },
    );

    if (oldBarbershop !== userEdited.barbershop) {
      await this.barberModel.findByIdAndUpdate(oldBarbershop, {
        $pull: { auth: user.id },
      });

      await this.barberModel.findByIdAndUpdate(userEdited.barbershop, {
        $push: { auth: userEdited.id },
      });
    }

    return { userEdited };
  }

  async remove(id: string, barberShopId: string) {
    const user = await this.authModel
      .findOneAndDelete({
        _id: id,
        barbershop: barberShopId,
      })
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.barberModel.findByIdAndUpdate(barberShopId, {
      $pull: { auth: user.id },
    });
    return { message: 'User removed successfully' };
  }

  private async getAllUnitsFromBarbershop(
    barbershopId: string,
  ): Promise<string[]> {
    const barbershop = await this.barberModel
      .findById(barbershopId)
      .select('units')
      .exec();

    if (!barbershop || !barbershop.unit?.length) {
      throw new NotFoundException('No units found for the barbershop');
    }

    return barbershop.unit;
  }
}
