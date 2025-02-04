import { Document } from 'mongoose';

export interface Appointment extends Document {
  client: string | null;
  guestName: string | null;
  barber: string;
  barbershop: string;
  service: string;
  serviceType: 'local' | 'global';
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  unit: string;
}
