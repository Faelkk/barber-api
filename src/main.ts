import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Barber Api')
    .setDescription(
      'A Barber API é um software para o gerenciamento de barbearias, desenvolvida com NestJS e Mongoose, utilizando MongoDB para armazenamento de dados e Supabase para o storage de imagens.',
    )
    .setVersion('1.0')
    .addTag('Barber')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(5000);
}
bootstrap();
