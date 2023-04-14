import {NestFactory} from '@nestjs/core';

import {loadPlugins} from '@/plugins';

export * from './settings/util';
export * from './events/impl/on-telegram-message.event';

async function bootstrap(): Promise<void> {
  await loadPlugins();
  const {AppModule} = await import('./app.module');
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}
bootstrap();
