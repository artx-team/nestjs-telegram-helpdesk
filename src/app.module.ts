import {BullModule, InjectQueue} from '@nestjs/bull';
import {Module, OnApplicationShutdown, OnModuleDestroy, OnModuleInit, Optional} from '@nestjs/common';
import {CqrsModule} from '@nestjs/cqrs';
import {TypeOrmModule} from '@nestjs/typeorm';
import type {Queue} from 'bull';
import {HeaderResolver, I18nModule, I18nYamlLoader} from 'nestjs-i18n';
import {TelegrafModule} from 'nestjs-telegraf';
import PostgresSession from 'telegraf-postgres-session';

import * as console from 'console';
import path from 'path';

import {AppUpdate} from './app.update';

import {OrmModule} from '@/orm/orm.module';
import {plugins} from '@/plugins';
import {AppProcessor} from '@/processors/app.processor';
import {CategoriesProcessor} from '@/processors/categories.processor';
import {REMOVE_OLD_TICKETS_QUEUE, RemoveOldTicketsProcessor} from '@/processors/remove-old-tickets.processor';
import settings from '@/settings';
import {StaffService} from '@/staff.service';
import {Message} from '@/ticket/message.entity';
import {Ticket} from '@/ticket/ticket.entity';
import {TicketService} from '@/ticket/ticket.service';

const {db} = settings;

@Module({
  imports: [
    ...plugins,
    CqrsModule,
    OrmModule,
    TypeOrmModule.forFeature([
      Ticket,
      Message,
    ]),

    // basic redis config if it is in settings
    ...!settings.redis ? [] : [
      BullModule.forRoot({
        redis: {
          host: settings.redis.host,
          port: settings.redis.port,
        },
      }),
    ],

    // register exhange queues
    ...!settings.bull ? [] : [
      BullModule.registerQueue(
        {name: settings.bull.appQueue},
        {name: settings.bull.categoriesQueue},
      ),
    ],

    // register removal queue
    ...!settings.tickets ? [] : [
      BullModule.registerQueue({name: REMOVE_OLD_TICKETS_QUEUE}),
    ],

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
      resolvers: [
        new HeaderResolver(['lang']),
      ],
    }),
  ],
  providers: [
    AppUpdate,
    StaffService,
    TicketService,
    ...!settings.bull ? [] : [
      CategoriesProcessor,
      AppProcessor,
    ],
    ...!settings.tickets ? [] : [
      RemoveOldTicketsProcessor,
    ],
  ],
})
export class AppModule implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown {
  constructor(
    @Optional() @InjectQueue(settings.bull?.appQueue) private readonly q: Queue,
    @Optional() @InjectQueue(REMOVE_OLD_TICKETS_QUEUE) private readonly tQ: Queue,
    private readonly staffService: StaffService,
  ) { }

  async onModuleInit(): Promise<void> {
    // Send init signal
    this.q?.add({}).catch(e => console.log(e));

    // remove repeatable jobs and add a new one
    if (this.tQ && settings.tickets?.daysToKeepTickets) {
      const jobs = await this.tQ.getRepeatableJobs();

      await Promise.all(jobs.map(job => this.tQ.removeRepeatableByKey(job.key)));

      await this.tQ.add(null, {
        repeat: {
          cron: settings.tickets.removeTicketsCron,
        },
      });
    }

    this.staffService.message('Application started').catch(e => console.log(e));
  }

  async onModuleDestroy(): Promise<void> {
    await this.staffService.message('Application stopped').catch(e => console.log(e));
  }

  async onApplicationShutdown(): Promise<void> {
    await this.staffService.message('Application shutdown').catch(e => console.log(e));
  }
}
