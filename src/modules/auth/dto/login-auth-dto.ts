import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()

  /** O Email é necessario para realizar o login do usuario, entretanto o email não pode ser o mesmo de outro usuario. */
  email: string;

  /*Senha obrigatória para login, a senha necessita no minimo 8 digitos */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  barbershop: string;
}
