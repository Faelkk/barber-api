import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsUrl,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

class SocialLinksDto {
  @IsUrl()
  @IsOptional()
  facebook?: string;

  @IsUrl()
  @IsOptional()
  instagram?: string;

  @IsUrl()
  @IsOptional()
  threads?: string;

  @IsUrl()
  @IsOptional()
  twitter?: string;

  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @IsUrl()
  @IsOptional()
  youtube?: string;

  @IsUrl()
  @IsOptional()
  tiktok?: string;
}

export class CreateBarberShopDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  appointments?: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  @IsOptional()
  socialLinks?: SocialLinksDto;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  auth?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  services?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  unit?: string[];
}
