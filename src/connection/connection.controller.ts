import { Controller } from '@nestjs/common';
import { ConnectService } from './connection.service';

@Controller('connect')
export class ConnectController {
  constructor(private readonly connectService: ConnectService) {}
}
