import { Document } from 'mongoose';

export interface BarberShop extends Document {
  name: string;
  description: string;
  avatar: string;
  thumbnail: string;
  appointments: string[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    threads?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  phoneNumber: string;
  email: string;
  auth: string[];
  globalService: string[];
  localService: string[];
  unit: string[];
  holidays: string[];
}
