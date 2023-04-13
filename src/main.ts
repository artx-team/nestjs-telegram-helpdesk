import {NestFactory} from '@nestjs/core';

import {loadPlugins} from '@/plugins';

async function bootstrap(): Promise<void> {
  await loadPlugins();
  const {AppModule} = await import('./app.module');
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}
bootstrap();
