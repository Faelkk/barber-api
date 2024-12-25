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
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * E-mail do usuário.
   */
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * Senha do usuário.
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  /**
   * Número de telefone do usuário.
   */
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  phoneNumber: string;

  /**
   * Papel do usuário.
   */
  @IsString()
  @IsNotEmpty()
  @IsEnum(['Client', 'Barber', 'Admin'])
  role: 'Client' | 'Barber' | 'Admin';

  /**
   * Descrição do usuário.
   */
  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  barbershop: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  units?: string[];
}
