import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/** Configuração compartilhada entre a aplicação e os testes e2e. */
export function configurar(app: INestApplication): void {
  app.setGlobalPrefix('api');
  const documento = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Smart City Operations Center')
      .setDescription('Interface de programação do Centro Integrado de Operações Urbanas de Ponta Grossa')
      .setVersion('0.1.0')
      .build(),
  );
  SwaggerModule.setup('api/docs', app, documento);
}
