import { Schema, Types } from 'mongoose';

export const unitSchema = new Schema({
  address: {
    fullAddress: { type: String, required: true },
    road: { type: String, required: true },
    neighborhood: { type: String, required: true },
    cep: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
  },
  avatar: { type: String, required: true },
  thumbnail: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  description: { type: String, required: true },
  operatingHours: {
    monday: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    tuesday: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    wednesday: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    thursday: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    friday: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    saturday: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    sunday: {
      start: { type: String },
      end: { type: String },
    },
  },

  localService: [{ type: Schema.Types.ObjectId, ref: 'LocalService' }],
  auth: [{ type: Types.ObjectId, ref: 'Auth' }],
  barbershop: {
    type: Schema.Types.ObjectId,
    ref: 'BarberShop',
    required: true,
  },
});
