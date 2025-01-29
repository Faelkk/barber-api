import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {
  /** O Email é necessario para realizar o login do usuario, entretanto o email não pode ser o mesmo de outro usuario. */
  @ApiProperty({ description: 'E-mail do usuário' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /*Senha obrigatória para login, a senha necessita no minimo 8 digitos */
  @ApiProperty({ description: 'Senha do usuário', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  /*Id da barbearia*/
  @ApiProperty({ description: 'ID da barbearia do usuário' })
  @IsString()
  @IsNotEmpty()
  barbershop: string;
}
