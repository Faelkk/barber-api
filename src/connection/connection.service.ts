import { Injectable, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import { env } from 'src/shared/config/env';

@Injectable()
export class ConnectService implements OnModuleInit {
  async onModuleInit() {
    await mongoose.connect(env.dbURL).then(() => {
      console.log('Connection to MongoDB successfully established!');
    });
  }
}
