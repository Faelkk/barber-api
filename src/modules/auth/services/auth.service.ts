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
import { randomBytes } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('Auth') private readonly authModel: Model<Auth>,
    @InjectModel('BarberShop') private readonly barberModel: Model<BarberShop>,
    @InjectModel('Unit') private readonly unitModel: Model<Unit>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
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

    let relatedUnits = [];

    if (role === 'Barber') {
      if (units?.length > 0) {
        const foundUnitsFromBarberShop =
          await this.getAllUnitsFromBarbershop(barbershop);

        relatedUnits = foundUnitsFromBarberShop.filter((unit) =>
          units.includes(unit),
        );
      } else {
        relatedUnits = await this.getAllUnitsFromBarbershop(barbershop);
      }
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
      throw new InternalServerErrorException('Failed to create user');
    }

    await this.barberModel.findByIdAndUpdate(barbershop, {
      $push: { auth: user.id },
    });

    if (relatedUnits.length > 0) {
      await this.unitModel.updateMany(
        { _id: { $in: relatedUnits } },
        { $push: { auth: user.id } },
      );
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
    return this.jwtService.signAsync(
      { sub: userId, role, barbershop },
      {
        expiresIn: '7d',
      },
    );
  }

  async checkToken(
    token: string,
  ): Promise<{ isValid: boolean; payload?: any }> {
    try {
      const payload = await this.jwtService.verifyAsync(token);

      return { isValid: true, payload };
    } catch {
      return { isValid: false };
    }
  }

  async sendRecoveryEmail(email: string) {
    const user = await this.authModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600 * 1000);

    await this.authModel.findOneAndUpdate(
      { email },
      {
        recoveryToken: token,
        recoveryTokenExpiration: expiration,
      },
      { new: true },
    );

    const recoveryLink = `https://your-frontend.com/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      from: 'premierbarberbr@gmail.com',
      subject: 'Password Recovery',
      html: `
      <p>Hello,</p>
      
      <p>You have requested to reset your password. If you did not make this request, please ignore this message.</p>
      
      <p>To reset your password, please click the link below:</p>
      
      <p>
        <a href="${recoveryLink}" style="color: #3498db; text-decoration: none;">Reset Password</a>
      </p>
      
      <p>If the link above does not work, copy and paste the following URL into your browser:</p>
      
      <p style="word-break: break-word;">${recoveryLink}</p>
      
      <p>Alternatively, you can use the following token to reset your password:</p>
      
      <p><strong>${token}</strong></p>
      
      <p><em>Note: This link and token will expire on ${expiration.toUTCString()}.</em></p>

      <p>Thank you!</p>
      
      <p>Premier Barber Team</p>
    `,
    });

    return { message: 'Recovery email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.authModel.findOne({
      recoveryToken: token,
      recoveryTokenExpiration: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const hashedPassword = await hash(newPassword, 12);

    await this.authModel.findOneAndUpdate(
      { recoveryToken: token },
      {
        password: hashedPassword,
        recoveryToken: null,
        recoveryTokenExpiration: null,
      },
      { new: true },
    );

    return { message: 'Password reset successful' };
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
    const { name, email, password, phoneNumber, description, units } =
      updateAuthDto;
    const user = await this.authModel.findById(id).exec();

    if (!user || user.role !== 'Barber') {
      throw new NotFoundException('Barber not found or invalid role');
    }

    const oldBarbershop = user.barbershop;

    let relatedUnits = [];

    if (units?.length > 0) {
      const foundUnitsFromBarberShop =
        await this.getAllUnitsFromBarbershop(oldBarbershop);

      relatedUnits = foundUnitsFromBarberShop.filter((unit) =>
        units.includes(unit),
      );
    } else {
      relatedUnits = await this.getAllUnitsFromBarbershop(oldBarbershop);
    }

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
        unit: relatedUnits,
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

    if (relatedUnits.length > 0) {
      await this.unitModel.updateMany(
        { _id: { $in: relatedUnits } },
        { $push: { auth: user.id } },
      );
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

    await this.unitModel.findByIdAndUpdate(barberShopId, {
      $pull: { auth: user.id },
    });

    return { message: 'User removed successfully' };
  }

  private async getAllUnitsFromBarbershop(
    barbershopId: string,
  ): Promise<string[]> {
    const units = await this.unitModel
      .find({ barbershop: barbershopId })
      .exec();

    if (!units) {
      throw new NotFoundException('No units found for the barbershop');
    }

    return units.map((unit) => unit.id);
  }
}
