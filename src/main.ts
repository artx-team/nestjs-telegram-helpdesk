import {NestFactory} from '@nestjs/core';

import {loadPlugins} from '@/plugins';

export * from './settings/util';
export * from './events/impl/on-telegram-message.event';
export * from './events/impl/on-message-to-staff.event';
export * from './next-function';
export * from './helpdesk-context';

async function bootstrap(): Promise<void> {
  await loadPlugins();
  const {AppModule} = await import('./app.module');
  const app = await NestFactory.createApplicationContext(AppModule);
  await app.init();
}
bootstrap();
