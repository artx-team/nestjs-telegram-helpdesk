import {EventBus} from '@nestjs/cqrs';
import {Command, Ctx, Hears, Next, On, Update, Use} from 'nestjs-telegraf';

import {NextFunction} from './next-function';

import {OnTelegramMessageEvent} from '@/events/impl/on-telegram-message.event';
import {FileType} from '@/file-type';
import {HelpdeskContext} from '@/helpdesk-context';
import settings from '@/settings';
import {TicketService} from '@/ticket/ticket.service';

@Update()
export class AppUpdate {

  constructor(
    private readonly ticketService: TicketService,
    private readonly eventBus: EventBus,
  ) { }

  @Use()
  async checkPermissions(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    if (ctx.session.categoryId && !this.ticketService.categories.some(c => c.id === ctx.session.categoryId)) {
      delete ctx.session.categoryId;
    }

    if (ctx.session.groupAdmin && ctx.chat.type == 'private') {
      delete ctx.session.groupAdmin;
    }

    if (this.ticketService.categories.length > 0) {
      ctx.session.groupAdmin = this.ticketService.categories.find(cat => cat.groupId === ctx.chat.id.toString())?.groupId;
    }

    // Is admin group
    ctx.session.admin = ctx.chat.id.toString() === settings.staffChatId || !!ctx.session.groupAdmin;
    if (ctx.session.admin) {
      console.log('Permission granted for ' + ctx.from.username);
    }

    return next();
  }

  @Command('id')
  async findId(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await ctx.reply(ctx.from.id + ' ' + ctx.chat.id);

    return next();
  }

  @Command('cat')
  async sendCurrentCategory(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.ticketService.sendCurrentCategory(ctx);

    return next();
  }

  @Command('close')
  async closeTicket(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.ticketService.closeTicket(ctx);

    return next();
  }

  @Command('reopen')
  async reopenTicket(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.ticketService.reopenTicket(ctx);

    return next();
  }

  @Command('clear')
  async closeAllTickets(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.ticketService.closeAllTickets(ctx);

    return next();
  }

  @Hears(/^\/start ?(.*)/)
  async start(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    const category = ctx.match[1];
    await this.ticketService.start(ctx, category);

    return next();
  }

  @Hears(/^(?!(\/start ))(.+)/)
  async hearsMessages(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.handleMessage(ctx);

    return next();
  }

  @On([FileType.Photo, FileType.Video, FileType.Document])
  async onPhoto(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.handleMessage(ctx);

    return next();
  }

  @On('sticker')
  async handleSticker(
    @Ctx() ctx: HelpdeskContext,
    @Next() next: NextFunction,
  ): Promise<void> {
    await this.handleMessage(ctx);

    return next();
  }

  private async handleMessage(ctx: HelpdeskContext): Promise<void> {
    const hook = new OnTelegramMessageEvent(ctx);
    this.eventBus.publish(hook);
    if (await hook.getResult()) {
      await this.ticketService.handleMessage(ctx);
    }
  }
}
