import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { env } from 'src/shared/config/env';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthSchema } from 'src/shared/schemas/auth.shcema';
import { BarberShopSchema } from 'src/shared/schemas/barber-shop.schema';
import { SupabaseModule } from 'src/shared/supabase/supabase.module';
import { unitSchema } from 'src/shared/schemas/unit.schema';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    SupabaseModule,
    JwtModule.register({
      secret: env.jwtSecret,

      signOptions: { expiresIn: '7d', algorithm: 'HS256' },
    }),

    MongooseModule.forFeature([{ name: 'Auth', schema: AuthSchema }]),
    MongooseModule.forFeature([
      { name: 'BarberShop', schema: BarberShopSchema },
    ]),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: env.MailerUser,
            pass: env.MailerPassword,
          },
        },

        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: __dirname + '/templates/',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    MongooseModule.forFeature([{ name: 'Unit', schema: unitSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
