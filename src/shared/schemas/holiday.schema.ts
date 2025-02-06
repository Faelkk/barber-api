import { Schema, Types } from 'mongoose';

export const HolidaySchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  barberShop: { type: Types.ObjectId, ref: 'BarberShop', required: true },
});
