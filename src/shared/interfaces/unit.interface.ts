import { Document } from 'mongoose';

export interface Unit extends Document {
  address: {
    fullAddress: string;
    road: string;
    neighborhood: string;
    cep: string;
    state: string;
    country: string;
    city: string;
  };
  phoneNumber: string;
  avatar: string;
  thumbnail: string;
  operatingHours: {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
    saturday: { start: string; end: string };
    sunday?: { start?: string; end?: string };
  };
  localService: string[];
  auth: string[];
  barbershop: string;
  description: string;
}
