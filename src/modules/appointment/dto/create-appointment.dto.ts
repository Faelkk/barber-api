import {
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsMongoId()
  @IsNotEmpty()
  client: string;

  @IsMongoId()
  @IsNotEmpty()
  barber: string;

  @IsMongoId()
  @IsNotEmpty()
  service: string;

  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsMongoId()
  @IsNotEmpty()
  unit: string;

  @IsEnum(['local', 'global'])
  @IsNotEmpty()
  serviceType: 'local' | 'global';

  @IsEnum(['scheduled', 'completed'])
  @IsOptional()
  status: 'scheduled' | 'completed';
}
