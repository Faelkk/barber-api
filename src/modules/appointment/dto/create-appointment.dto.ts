import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsMongoId,
  IsEnum,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateAppointmentDto {
  /*
   * ID do cliente associado ao agendamento
   */

  @IsOptional()
  @IsString()
  @ValidateIf((obj) => !obj.guestName)
  client?: string;

  /*
   * Nome cliente associado ao agendamento
   */

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ValidateIf((obj) => !obj.client)
  guestName?: string;

  /*
   * ID do barbeiro associado ao agendamento
   */
  @ApiProperty({ description: 'ID do barbeiro associado ao agendamento' })
  @IsMongoId()
  @IsNotEmpty()
  barber: string;

  /*
   * ID do serviço associado ao agendamento  */
  @ApiProperty({ description: 'ID do serviço associado ao agendamento' })
  @IsMongoId()
  @IsNotEmpty()
  service: string;

  /*
   *ID da barbearia associada ao agendamento  */
  @ApiProperty({ description: 'ID da barbearia associada ao agendamento' })
  @IsMongoId()
  @IsNotEmpty()
  barbershop: string;

  /*
   *Data e hora do agendamento  */
  @ApiProperty({ description: 'Data e hora do agendamento' })
  @IsNotEmpty()
  @IsString()
  date: string;

  /*
   *ID da unidade associada ao agendamento  */
  @ApiProperty({ description: 'ID da unidade associada ao agendamento' })
  @IsMongoId()
  @IsNotEmpty()
  unit: string;

  /*
   *Tipo do serviço */
  @ApiProperty({ enum: ['local', 'global'], description: 'Tipo do serviço' })
  @IsEnum(['local', 'global'])
  @IsNotEmpty()
  serviceType: 'local' | 'global';

  /*
   *Status do agendamento */
  @ApiPropertyOptional({
    enum: ['scheduled', 'completed'],
    description: 'Status do agendamento',
  })
  @IsEnum(['scheduled', 'completed'])
  @IsOptional()
  status: 'scheduled' | 'completed';
}
