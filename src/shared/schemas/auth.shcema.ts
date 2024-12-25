import { Schema } from 'mongoose';

export const AuthSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  role: {
    type: String,
    enum: ['Client', 'Barber', 'Admin', 'Developer'],
    default: 'Client',
    required: true,
  },
  appointments: [{ type: Schema.Types.ObjectId, ref: 'Appointment' }],
  barbershop: {
    type: Schema.Types.ObjectId,
    ref: 'BarberShop',
    required: true,
  },
  avatar: { type: String },
  description: { type: String },
  thumbnail: { type: String },
  services: [{ type: Schema.Types.ObjectId, ref: 'LocalService' }],
  unit: [{ type: Schema.Types.ObjectId, ref: 'Unit' }],
});
