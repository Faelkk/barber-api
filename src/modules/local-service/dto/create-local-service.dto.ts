import {
  IsString,
  IsArray,
  IsNumber,
  IsMongoId,
  IsEnum,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateLocalServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsArray()
  @IsMongoId({ each: true }) // Verifica se cada item no array é um ObjectId válido
  @IsNotEmpty()
  barbers: string[];

  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;

  @IsMongoId()
  @IsNotEmpty()
  unit: string;

  @IsEnum(['local'])
  type: 'local';
}
