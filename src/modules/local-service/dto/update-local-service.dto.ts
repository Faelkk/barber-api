import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalServiceDto } from './create-local-service.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocalServiceDto extends PartialType(CreateLocalServiceDto) {
  @ApiPropertyOptional({ description: 'Nome do serviço local' })
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do serviço local' })
  description?: string;

  @ApiPropertyOptional({ description: 'Preço do serviço local', minimum: 0 })
  price?: number;

  @ApiPropertyOptional({
    description: 'Duração do serviço local em minutos',
    minimum: 1,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'IDs dos barbeiros associados ao serviço local',
    type: [String],
  })
  barbers?: string[];

  @ApiPropertyOptional({
    description: 'ID da barbearia associada ao serviço local',
  })
  barbershop?: string;

  @ApiPropertyOptional({
    description: 'ID da unidade associada ao serviço local',
  })
  unit?: string;

  @ApiPropertyOptional({
    enum: ['local'],
    description: 'Tipo do serviço local',
  })
  type?: 'local';
}
