import {Injectable} from '@nestjs/common';
import {InjectBot} from 'nestjs-telegraf';
import {Telegraf} from 'telegraf';

import {HelpdeskContext} from '@/helpdesk-context';
import settings from '@/settings';

@Injectable()
export class StaffService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<HelpdeskContext>,
  ) { }

  message(message: string): Promise<any> {
    return this.bot.telegram.sendMessage(
      settings.staffChatId,
      message,
      {parse_mode: 'HTML'},
    );
  }
}
