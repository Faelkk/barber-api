import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId, IsBoolean } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ description: 'Endereço da unidade' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'ID da barbearia associada à unidade' })
  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;

  @ApiProperty({ description: 'Horário de funcionamento da unidade' })
  @IsString()
  @IsNotEmpty()
  operatingHours: string;

  @ApiProperty({ description: 'Número de telefone da unidade' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ description: 'Indica se a unidade está ativa' })
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Descrição da unidade' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
