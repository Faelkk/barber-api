import { Document } from 'mongoose';

export interface LocalService extends Document {
  name: string;
  description?: string;
  duration: number;
  price: number;
  barbers: string[];
  barbershop: string;
  unit: string;
  type: 'local';
  avatar: string;
  thumbnail: string;
}
