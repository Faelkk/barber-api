export interface GlobalService extends Document {
  name: string;
  description: string;
  duration: number;
  price: number;
  barbershop: string;
  type: 'global';
  avatar: string;
  thumbnail: string;
}
