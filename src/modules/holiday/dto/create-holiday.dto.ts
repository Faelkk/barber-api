import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateHolidayDto {
  @ApiProperty({ description: 'Nome do feriado' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Data do feriado' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Id da barbearia' })
  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;
}
