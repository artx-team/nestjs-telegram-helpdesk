import {Module, OnModuleInit, Optional} from '@nestjs/common';
import {TelegrafModule} from 'nestjs-telegraf';
import {AppUpdate} from './app.update';
import settings from '@/settings';
import PostgresSession from 'telegraf-postgres-session';
import {BullModule, InjectQueue} from '@nestjs/bull';
import {TicketService} from '@/ticket/ticket.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Ticket} from '@/ticket/ticket.entity';
import {OrmModule} from '@/orm/orm.module';
import {Message} from '@/ticket/message.entity';
import {CategoriesProcessor} from '@/processors/categories.processor';
import {AppProcessor} from '@/processors/app.processor';
const {db} = settings;
import type {Queue} from 'bull';
import {I18nModule, I18nYamlLoader} from 'nestjs-i18n';
import path from 'path';

@Module({
  imports: [
    OrmModule,
    TypeOrmModule.forFeature([
      Ticket,
      Message,
    ]),
    ...(settings.redis && settings.bull) ? [
      BullModule.forRoot({
        redis: {
          host: settings.redis.host,
          port: settings.redis.port,
        },
      }),
      BullModule.registerQueue(
        {name: settings.bull.appQueue},
        {name: settings.bull.categoriesQueue},
      ),
    ] : [],
    TelegrafModule.forRoot({
      token: settings.botToken,
      middlewares: [
        (new PostgresSession({
          user: db.username,
          host: db.host,
          database: db.database,
          password: db.password,
          port: db.port,
        })).middleware(),
      ],
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
      },
      loader: I18nYamlLoader,
    }),
  ],
  providers: [
    AppUpdate,
    TicketService,
    ...settings.bull ? [
      CategoriesProcessor,
      AppProcessor,
    ] : [],
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Optional() @InjectQueue(settings.bull?.appQueue) private readonly q: Queue,
  ) { }

  // Send init signal
  onModuleInit(): void {
    this.q?.add({});
  }
}
