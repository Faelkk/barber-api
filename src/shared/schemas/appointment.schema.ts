import { Schema } from 'mongoose';

export const AppointmentSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  barber: { type: Schema.Types.ObjectId, ref: 'Auth', required: true },
  service: {
    type: Schema.Types.ObjectId,
    ref: 'GlobalService',
    required: true,
  },
  barbershop: {
    type: Schema.Types.ObjectId,
    ref: 'BarberShop',
    required: true,
  },
  serviceType: {
    type: String,
    enum: ['local', 'global'],
    required: true,
  },
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'completed'],
    default: 'scheduled',
  },
});
