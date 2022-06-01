import {Module, OnApplicationShutdown, OnModuleDestroy, OnModuleInit, Optional} from '@nestjs/common';
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
import {REMOVE_OLD_TICKETS_QUEUE, RemoveOldTicketsProcessor} from '@/processors/remove-old-tickets.processor';
import {StaffService} from '@/staff.service';

@Module({
  imports: [
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

  async onApplicationShutdown(signal?: string): Promise<void> {
    await this.staffService.message('Application shutdown').catch(e => console.log(e));
  }
}
