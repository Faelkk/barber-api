import { Schema, Types } from 'mongoose';

export const BarberShopSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  avatar: { type: String },
  thumbnail: { type: String },
  auth: [{ type: Types.ObjectId, ref: 'Auth' }],
  appointments: [{ type: Types.ObjectId, ref: 'Appointment' }],
  globalService: [{ type: Types.ObjectId, ref: 'GlobalService' }],
  unit: [{ type: Types.ObjectId, ref: 'Unit' }],
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  holidays: [{ type: Types.ObjectId, ref: 'Holiday' }],
  socialLinks: {
    facebook: { type: String },
    instagram: { type: String },
    threads: { type: String },
    twitter: { type: String },
    linkedin: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
  },
});
