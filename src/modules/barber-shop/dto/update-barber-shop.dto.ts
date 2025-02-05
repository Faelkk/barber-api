import { PartialType } from '@nestjs/mapped-types';
import { CreateBarberShopDto, SocialLinksDto } from './create-barber-shop.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBarberShopDto extends PartialType(CreateBarberShopDto) {
  @ApiPropertyOptional({ description: 'Nome da barbearia' })
  name?: string;

  @ApiPropertyOptional({ description: 'Descrição da barbearia' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Lista de IDs de agendamentos da barbearia',
    type: [String],
  })
  appointments?: string[];

  @ApiPropertyOptional({ description: 'Numero da barbearia' })
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Email da barbearia' })
  email: string;

  @ApiPropertyOptional({
    description: 'Links sociais da barbearia',
    type: () => SocialLinksDto,
  })
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    description: 'Lista de IDs de usuários autenticados da barbearia',
    type: [String],
  })
  auth?: string[];

  @ApiPropertyOptional({
    description: 'Lista de IDs de serviços oferecidos pela barbearia',
    type: [String],
  })
  services?: string[];

  @ApiPropertyOptional({
    description: 'Lista de IDs das unidades da barbearia',
    type: [String],
  })
  unit?: string[];
}
