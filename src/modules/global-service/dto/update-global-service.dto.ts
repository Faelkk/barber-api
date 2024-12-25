import { PartialType } from '@nestjs/mapped-types';
import { CreateGlobalServiceDto } from './create-global-service.dto';

export class UpdateGlobalServiceDto extends PartialType(
  CreateGlobalServiceDto,
) {}
