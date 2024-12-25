import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalServiceDto } from './create-local-service.dto';

export class UpdateLocalServiceDto extends PartialType(CreateLocalServiceDto) {}
