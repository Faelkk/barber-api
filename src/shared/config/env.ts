import { config } from 'dotenv';
config();

import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsString, NotEquals, validateSync } from 'class-validator';
import { InternalServerErrorException } from '@nestjs/common';

class Env {
  @IsString()
  @IsNotEmpty()
  dbURL: string;

  @IsString()
  @IsNotEmpty()
  @NotEquals('unsecure_jwt_secret')
  jwtSecret: string;

  @IsString()
  @IsNotEmpty()
  supabaseKey: string;

  @IsString()
  @IsNotEmpty()
  supabaseUrl: string;

  @IsString()
  @IsNotEmpty()
  MailerUser: string;

  @IsString()
  @IsNotEmpty()
  MailerPassword: string;

  PORT: string;
}

export const env: Env = plainToInstance(Env, {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  dbURL: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  MailerUser: process.env.MAILER_USER,
  MailerPassword: process.env.MAILER_PASS,
});

const errors = validateSync(env);

if (errors.length > 0) {
  throw new InternalServerErrorException(JSON.stringify(errors, null, 2));
}
