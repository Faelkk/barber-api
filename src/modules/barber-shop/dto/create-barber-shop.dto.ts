import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsUrl,
  IsMongoId,
  IsEmail,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SocialLinksDto {
  @ApiPropertyOptional({ description: 'URL do Facebook da barbearia' })
  @IsUrl()
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ description: 'URL do Instagram da barbearia' })
  @IsUrl()
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ description: 'URL do Threads da barbearia' })
  @IsUrl()
  @IsOptional()
  threads?: string;

  @ApiPropertyOptional({ description: 'URL do Twitter da barbearia' })
  @IsUrl()
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ description: 'URL do LinkedIn da barbearia' })
  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'URL do YouTube da barbearia' })
  @IsUrl()
  @IsOptional()
  youtube?: string;

  @ApiPropertyOptional({ description: 'URL do TikTok da barbearia' })
  @IsUrl()
  @IsOptional()
  tiktok?: string;
}

export class CreateBarberShopDto {
  @ApiProperty({ description: 'Nome da barbearia' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Descrição da barbearia' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Numero da barbearia' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Email da barbearia' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Lista de IDs de agendamentos da barbearia',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  appointments?: string[];

  @ApiPropertyOptional({
    description: 'Links sociais da barbearia',
    type: () => SocialLinksDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @ApiPropertyOptional({
    description: 'Lista de IDs de usuários autenticados da barbearia',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  auth?: string[];

  @ApiPropertyOptional({
    description: 'Lista de IDs de serviços oferecidos pela barbearia',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  services?: string[];

  @ApiPropertyOptional({
    description: 'Lista de IDs das unidades da barbearia',
    type: [String],
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  unit?: string[];
}
