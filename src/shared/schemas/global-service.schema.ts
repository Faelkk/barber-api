import { Schema } from 'mongoose';

export const globalServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  price: { type: Number, required: true },
  avatar: { type: String },
  thumbnail: { type: String },
  barbershop: {
    type: Schema.Types.ObjectId,
    ref: 'BarberShop',
    required: true,
  },
  type: {
    type: String,
    enum: ['global'],
    required: true,
  },
});
