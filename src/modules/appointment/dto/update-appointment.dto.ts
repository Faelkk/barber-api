import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  // * ID do cliente associado ao agendamento
  @ApiPropertyOptional({
    description: 'ID do cliente associado ao agendamento',
  })
  client?: string;

  // * ID do barbeiro associado ao agendamento
  @ApiPropertyOptional({
    description: 'ID do barbeiro associado ao agendamento',
  })
  barber?: string;

  // * ID do serviço associado ao agendamento
  @ApiPropertyOptional({
    description: 'ID do serviço associado ao agendamento',
  })
  service?: string;

  // * ID da barbearia associada ao agendamento
  @ApiPropertyOptional({
    description: 'ID da barbearia associada ao agendamento',
  })
  barbershop?: string;

  // * Data e hora do agendamento
  @ApiPropertyOptional({ description: 'Data e hora do agendamento' })
  date?: string;

  // * ID da unidade associada ao agendamento
  @ApiPropertyOptional({
    description: 'ID da unidade associada ao agendamento',
  })
  unit?: string;

  // * Tipo do serviço
  @ApiPropertyOptional({
    enum: ['local', 'global'],
    description: 'Tipo do serviço',
  })
  serviceType?: 'local' | 'global';

  // * Status do agendamento
  @ApiPropertyOptional({
    enum: ['scheduled', 'completed'],
    description: 'Status do agendamento',
  })
  status?: 'scheduled' | 'completed';
}
