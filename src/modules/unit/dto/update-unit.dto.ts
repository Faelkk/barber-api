import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitDto } from './create-unit.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {
  @ApiPropertyOptional({ description: 'Endereço da unidade' })
  address?: string;

  @ApiPropertyOptional({ description: 'ID da barbearia associada à unidade' })
  barbershop?: string;

  @ApiPropertyOptional({ description: 'Horário de funcionamento da unidade' })
  operatingHours?: string;

  @ApiPropertyOptional({ description: 'Número de telefone da unidade' })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Indica se a unidade está ativa' })
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Descrição da unidade' })
  description?: string;
}
