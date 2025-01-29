import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({ description: 'Nome do serviço local' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição do serviço local' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Preço do serviço local', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Duração do serviço local em minutos',
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'IDs dos barbeiros associados ao serviço local',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsNotEmpty()
  barbers: string[];

  @ApiProperty({ description: 'ID da barbearia associada ao serviço local' })
  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;

  @ApiProperty({ description: 'ID da unidade associada ao serviço local' })
  @IsMongoId()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ enum: ['local'], description: 'Tipo do serviço local' })
  @IsEnum(['local'])
  @IsNotEmpty()
  type: 'local';
}
