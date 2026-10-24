import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configurar(app: INestApplication): void {
  // o ip de origem do log chega pelo proxy do nginx
  (app as NestExpressApplication).set('trust proxy', 'loopback, linklocal, uniquelocal');
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Smart City Operations Center')
      .setDescription('Interface de programação do Centro Integrado de Operações Urbanas de Ponta Grossa')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api/docs', app, documento);
}
