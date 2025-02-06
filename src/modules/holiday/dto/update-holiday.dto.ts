import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateHolidayDto } from './create-holiday.dto';

export class UpdateHolidayDto extends PartialType(CreateHolidayDto) {
  @ApiPropertyOptional({ description: 'Nome do feriado' })
  name: string;

  @ApiPropertyOptional({ description: 'Data do feriado' })
  date: string;

  @ApiPropertyOptional({ description: 'Id da barbearia' })
  barbershop: string;
}
