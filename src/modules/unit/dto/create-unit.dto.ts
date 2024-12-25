import { IsString, IsNotEmpty, IsMongoId, IsBoolean } from 'class-validator';

export class CreateUnitDto {
  @IsString()
  address: string;

  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;

  @IsString()
  operatingHours: string;

  @IsString()
  phoneNumber: string;

  @IsBoolean()
  enabled: boolean;

  @IsString()
  description: string;
}
