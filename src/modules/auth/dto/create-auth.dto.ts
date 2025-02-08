import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateAuthDto {
  /**
   * Nome do usuário.
   */
  @ApiProperty({ description: 'Nome do usuário' })
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * E-mail do usuário.
   */
  @ApiProperty({ description: 'E-mail do usuário' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Senha do usuário.
   */
  @ApiProperty({ description: 'Senha do usuário', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  /**
   * Número de telefone do usuário.
   */
  @ApiProperty({ description: 'Número de telefone do usuário' })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  phoneNumber: string;

  /**
   * Papel do usuário.
   */
  @ApiProperty({
    enum: ['Client', 'Barber', 'Admin'],
    description: 'Papel do usuário',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Client', 'Barber', 'Admin'])
  role: 'Client' | 'Barber' | 'Admin';

  /**
   * Descrição do usuário (opcional).
   */
  @ApiPropertyOptional({ description: 'Descrição do usuário' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID da barbearia do usuário' })
  @IsString()
  @IsNotEmpty()
  barbershop: string;

  @ApiPropertyOptional({
    description: 'Unidades da barbearia do usuário',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  unit?: string[];
}
