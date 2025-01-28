import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from 'src/shared/interfaces/appointment.interface';
import { Unit } from 'src/shared/interfaces/unit.interface';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
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

  async getAvailableTimeslots(unitId: string, date: string) {
    const unitExists = await this.unitModel.findById(unitId).exec();
    if (!unitExists) {
      throw new NotFoundException('Unit not found');
    }

    const operatingHours = unitExists.operatingHours;

    const appointmentDate = date;

    const dayOfWeek = format(appointmentDate, 'eeee', {
      locale: enUS,
    }).toLowerCase();

    const hours = operatingHours[dayOfWeek];

    if (!hours || !hours.start || !hours.end) {
      throw new BadRequestException(
        'The unit does not operate on the selected day.',
      );
    }

    const appointments = await this.appointmentModel
      .find({
        unit: unitId,
        date: {
          $gte: startOfDay(appointmentDate).toISOString(),
          $lt: endOfDay(appointmentDate).toISOString(),
        },
      })

      .exec();

    const formattedTimes = appointments.map((appointment) =>
      format(parseISO(appointment.date), 'HH:mm'),
    );

    const availableSlots =
      this.appointmentValidationService.calculateAvailableSlots(
        hours.start,
        hours.end,
        formattedTimes,
      );

    return availableSlots;
  }

  async create(
    createAppointmentDto: CreateAppointmentDto,
    userId: string,
    userRole: string,
  ) {
    const {
      barber,
      client,
      date,
      service,
      status,
      barbershop,
      unit,
      serviceType,
    } = createAppointmentDto;

    await this.appointmentValidationService.validateUserPermission(
      userRole,
      userId,
      client,
      barber,
    );
    await this.appointmentValidationService.validateBarber(barber);
    await this.appointmentValidationService.validateAppointmentExistence(
      barber,
      unit,
      date,
    );
    const availableSlots = await this.getAvailableTimeslots(unit, date);

    const appointmentDate = date;

    const appointmentTime = format(appointmentDate, 'HH:mm');

    if (!availableSlots.includes(appointmentTime)) {
      throw new BadRequestException(
        `The selected time (${appointmentTime}) is not available.`,
      );
    }

    await this.appointmentValidationService.validateAppointmentTime(date, unit);

    await this.appointmentValidationService.validateServiceExistence(
      service,
      serviceType,
    );

    const appointment = await this.appointmentModel.create({
      barber,
      client,
      date,
      service,
      status,
      unit,
      barbershop,
      serviceType,
    });

    const users = await this.authModel.find({ barbershop }).exec();

    await this.unitModel.findByIdAndUpdate(
      appointment._id,
      { $push: { auth: { $each: users.map((user) => user._id) } } },
      { new: true },
    );

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
    const availableSlots = await this.getAvailableTimeslots(unit, date);
    const appointmentTime = format(parseISO(date), 'HH:mm');

    if (!availableSlots.includes(appointmentTime)) {
      throw new BadRequestException(
        `The selected time (${appointmentTime}) is not available.`,
      );
    }

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
