import {NestFactory} from '@nestjs/core';

import {AppModule} from './app.module';

import {importModules} from '@/import-modules';

async function bootstrap(): Promise<void> {
  await importModules();
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}
bootstrap();

