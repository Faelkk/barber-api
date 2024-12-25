import { Module } from '@nestjs/common';
import { ConnectController } from './connection.controller';
import { ConnectService } from './connection.service';

@Module({
  controllers: [ConnectController],
  providers: [ConnectService],
})
export class ConnectModule {}
