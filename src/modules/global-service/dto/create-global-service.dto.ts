import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator';

export class CreateGlobalServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  duration: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  barbershop: string;

  @IsEnum(['global'])
  @IsNotEmpty()
  type: 'global';
}
