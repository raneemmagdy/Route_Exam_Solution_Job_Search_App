import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 5000;
  //-----------------------------------------CORS--------------------------------------------
  app.enableCors({ origin: '*' });
  //-----------------------------------------Helmet-------------------------------------------
  app.use(helmet());
  //-----------------------------------------Start Server--------------------------------------------
  await app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
}
bootstrap();
