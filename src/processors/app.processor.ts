import {
  OnGlobalQueueFailed,
  Processor,
} from '@nestjs/bull';

import settings from '@/settings';

@Processor(settings.bull?.appQueue)
export class AppProcessor {

  @OnGlobalQueueFailed()
  async fail(...args): Promise<void> {
    console.log('on q fail', args);
  }
}
