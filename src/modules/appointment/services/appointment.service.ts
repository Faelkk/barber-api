import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from 'src/shared/interfaces/appointment.interface';
import { Unit } from 'src/shared/interfaces/unit.interface';

import { AppointmentValidationService } from './validation-appointment.service';
import { Auth } from 'src/shared/interfaces/auth.interface';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('Unit')
    private readonly unitModel: Model<Unit>,
    @InjectModel('Auth')
    private readonly authModel: Model<Auth>,

    private readonly appointmentValidationService: AppointmentValidationService,
  ) {}

  async getAvailableTime(unitId: string, date: string) {
    const { unitExists } =
      await this.appointmentValidationService.validateUnitsExists(unitId);

    const availableSlots =
      this.appointmentValidationService.getAvailableTimeslots(unitExists, date);

    return availableSlots;
  }

  async createForGuest(createAppointmentDto: CreateAppointmentDto) {
    const { guestName, date, service, barbershop, unit, serviceType, barber } =
      createAppointmentDto;

    if (!guestName) {
      throw new BadRequestException('É necessário fornecer um guestName.');
    }

    await this.appointmentValidationService.validateServiceExistence(
      service,
      serviceType,
    );

    const availableSlots =
      await this.appointmentValidationService.getAvailableTimeslots(unit, date);

    await this.appointmentValidationService.checkAppointmentIsAvailable(
      availableSlots,
      date,
    );

    const appointment = await this.appointmentModel.create({
      barber,
      guestName,
      date,
      service,
      barbershop,
      unit,
      serviceType,
      status: 'scheduled',
    });

    if (!appointment) {
      throw new InternalServerErrorException();
    }

    return { appointment };
  }

  async updateForGuest(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const { date, service, status, unit, serviceType, barber, guestName } =
      updateAppointmentDto;

    const existingAppointment = await this.appointmentModel
      .findOne({ _id: id, guestName: { $ne: null } })
      .exec();

    if (!existingAppointment) {
      throw new NotFoundException('Agendamento para convidado não encontrado.');
    }

    const availableSlots =
      await this.appointmentValidationService.getAvailableTimeslots(unit, date);
    await this.appointmentValidationService.checkAppointmentIsAvailable(
      availableSlots,
      date,
    );

    await this.appointmentValidationService.validateServiceExistence(
      service,
      serviceType,
    );

    const updatedAppointment = await this.appointmentModel.findOneAndUpdate(
      { _id: id },
      { date, service, status, unit, serviceType, barber, guestName },
      { new: true },
    );

    if (!updatedAppointment) {
      throw new InternalServerErrorException();
    }

    return { updatedAppointment };
  }

  async changeStatus(id: string) {
    const existingAppointment = await this.appointmentModel
      .findOne({ _id: id })
      .exec();

    if (!existingAppointment) {
      throw new NotFoundException('Agendamento para convidado não encontrado.');
    }

    if (existingAppointment.status !== 'scheduled') {
      throw new BadRequestException(
        'O status deste agendamento não pode ser mudado.',
      );
    }

    const updatedAppointment = await this.appointmentModel.findOneAndUpdate(
      { _id: id },
      { status: 'completed' },
    );

    if (!updatedAppointment) {
      throw new InternalServerErrorException();
    }

    return { updatedAppointment };
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
    userRole: string,
  ) {
    const { barber, client, date, service, barbershop, unit, serviceType } =
      createAppointmentDto;

    await this.appointmentValidationService.validateUserPermission(
      userRole,
      userId,
      client,
      barber,
    );

    if (!client) {
      throw new BadRequestException('client é obrigatorio');
    }

    const { unitExists } =
      await this.appointmentValidationService.validateUnitsExists(unit);

    await this.appointmentValidationService.validateBarber(barber);

    await this.appointmentValidationService.validateAppointmentTime(
      date,
      unitExists,
    );
    await this.appointmentValidationService.validateServiceExistence(
      service,
      serviceType,
    );

    await this.appointmentValidationService.validateAppointmentExistence(
      barber,
      unit,
      date,
    );

    const availableSlots =
      await this.appointmentValidationService.getAvailableTimeslots(
        unitExists,
        date,
      );

    await this.appointmentValidationService.checkAppointmentIsAvailable(
      availableSlots,
      date,
    );

    const appointment = await this.appointmentModel.create({
      barber,
      client: client,
      date,
      service,
      barbershop,
      unit,
      serviceType,
      status: 'scheduled',
    });

    if (!appointment) {
      throw new InternalServerErrorException();
    }

    return { appointment };
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
    userRole: string,
    barberShop: string,
  ) {
    const { barber, client, date, service, status, unit, serviceType } =
      updateAppointmentDto;

    if (!client) {
      throw new BadRequestException('client é obrigatorio');
    }

    await this.appointmentValidationService.validateUserPermission(
      userRole,
      userId,
      client,
      barber,
    );

    const existingAppointment = await this.appointmentModel
      .findOne({ barber, unit, client: client, _id: id })
      .exec();

    if (!existingAppointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (existingAppointment.date === date) {
      throw new ConflictException(
        'An appointment already exists for this time slot at this unit.',
      );
    }
    await this.appointmentValidationService.validateBarber(barber);

    await this.appointmentValidationService.validateAppointmentExistence(
      barber,
      unit,
      date,
      id,
    );
    const availableSlots =
      await this.appointmentValidationService.getAvailableTimeslots(unit, date);

    await this.appointmentValidationService.checkAppointmentIsAvailable(
      availableSlots,
      date,
    );
    await this.appointmentValidationService.validateServiceExistence(
      service,
      serviceType,
    );
    await this.appointmentValidationService.validateAppointmentTime(date, unit);

    const updatedAppointment = await this.appointmentModel.findOneAndUpdate(
      { _id: id },
      { barber, client, date, service, status, unit, serviceType },
      { new: true },
    );

    if (!updatedAppointment) {
      throw new InternalServerErrorException();
    }

    const users = await this.authModel.find({ barberShop }).exec();

    await this.unitModel.findByIdAndUpdate(
      updatedAppointment._id,
      { $push: { auth: { $each: users.map((user) => user._id) } } },
      { new: true },
    );

    return { updatedAppointment };
  }

  async findAllByUserId(id: string, userId: string, userRole: string) {
    await this.appointmentValidationService.validatePermission(
      userRole,
      id,
      userId,
    );

    const filter =
      userRole === 'Barber' ? { barber: userId } : { client: userId };

    const modelToPopulate =
      await this.appointmentValidationService.getModelToPopulate(
        this.appointmentModel,
        filter,
      );

    const appointments = await this.appointmentModel
      .find(filter)
      .populate({
        path: 'service',
        model: modelToPopulate,
      })
      .populate(this.appointmentValidationService.getPopulateOptions())
      .exec();

    if (!appointments.length) {
      throw new NotFoundException('No appointments found for this client');
    }

    return { appointments };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const filter =
      userRole === 'Barber' ? { barber: userId } : { client: userId };

    const modelToPopulate =
      await this.appointmentValidationService.getModelToPopulate(
        this.appointmentModel,
        filter,
      );

    const appointments = await this.appointmentModel
      .findOne({
        _id: id,
      })
      .populate({
        path: 'service',
        model: modelToPopulate,
      })
      .populate(this.appointmentValidationService.getPopulateOptions())
      .exec();

    if (!appointments) {
      throw new NotFoundException('No appointments found for this client');
    }

    return { appointments };
  }

  async remove(id: string, userId: string, userRole: string) {
    const appointment =
      await this.appointmentValidationService.findOneWithValidation(
        id,
        userId,
        userRole,
        userRole === 'Client' ? 'client' : 'barber',
      );

    await appointment.deleteOne();

    return { deleted: true };
  }
}
