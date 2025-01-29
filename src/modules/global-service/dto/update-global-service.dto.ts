import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalServiceDto } from './create-global-service.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGlobalServiceDto extends PartialType(
  CreateGlobalServiceDto,
) {
  @ApiPropertyOptional({ description: 'Nome do serviço global' })
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição do serviço global' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Duração do serviço global em minutos',
    minimum: 1,
  })
  duration?: number;

  @ApiPropertyOptional({ description: 'Preço do serviço global', minimum: 0 })
  price?: number;

  @ApiPropertyOptional({
    description: 'ID da barbearia associada ao serviço global',
  })
  barbershop?: string;

  @ApiPropertyOptional({
    enum: ['global'],
    description: 'Tipo do serviço global',
  })
  type?: 'global';
}
