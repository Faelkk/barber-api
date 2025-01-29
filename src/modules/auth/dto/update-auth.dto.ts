import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @ApiPropertyOptional({ description: 'Nome do usuário' })
  name?: string;

  @ApiPropertyOptional({ description: 'E-mail do usuário' })
  email?: string;

  @ApiPropertyOptional({ description: 'Senha do usuário', minLength: 8 })
  password?: string;

  @ApiPropertyOptional({ description: 'Número de telefone do usuário' })
  phoneNumber?: string;

  @ApiPropertyOptional({
    enum: ['Client', 'Barber', 'Admin'],
    description: 'Papel do usuário',
  })
  role?: 'Client' | 'Barber' | 'Admin';

  @ApiPropertyOptional({ description: 'Descrição do usuário' })
  description?: string;

  @ApiPropertyOptional({ description: 'ID da barbearia do usuário' })
  barbershop?: string;

  @ApiPropertyOptional({
    description: 'Unidades da barbearia do usuário',
    type: [String],
  })
  units?: string[];
}
