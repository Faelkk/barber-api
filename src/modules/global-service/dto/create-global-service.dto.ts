import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsNotEmpty, Min } from 'class-validator';

export class CreateGlobalServiceDto {
  @ApiProperty({ description: 'Nome do serviço global' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descrição do serviço global' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Duração do serviço global em minutos',
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  duration: number;

  @ApiProperty({ description: 'Preço do serviço global', minimum: 0 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'ID da barbearia associada ao serviço global' })
  @IsString()
  @IsNotEmpty()
  barbershop: string;

  @ApiProperty({ enum: ['global'], description: 'Tipo do serviço global' })
  @IsEnum(['global'])
  @IsNotEmpty()
  type: 'global';
}
