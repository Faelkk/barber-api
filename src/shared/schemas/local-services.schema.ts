import { Schema } from 'mongoose';

export const localServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  avatar: { type: String },
  thumbnail: { type: String },
  barbers: [{ type: Schema.Types.ObjectId, ref: 'Auth', required: true }],
  barbershop: {
    type: Schema.Types.ObjectId,
    ref: 'BarberShop',
    required: true,
  },
  type: {
    type: String,
    enum: ['local'],
    required: true,
  },
  unit: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
});
