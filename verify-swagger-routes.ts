import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './src/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: false });

    const config = new DocumentBuilder()
        .setTitle('Trading Simulator API')
        .setDescription('State-of-the-Art Crypto Trading Simulation Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);

    console.log('--- SWAGGER PATHS ---');
    console.log(JSON.stringify(Object.keys(document.paths).sort(), null, 2));
    console.log('---------------------');

    await app.close();
}
bootstrap();
