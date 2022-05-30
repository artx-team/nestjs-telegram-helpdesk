import {Command, Ctx, Hears, Next, On, Update, Use} from 'nestjs-telegraf';
import {HelpdeskContext} from '@/helpdesk-context';
import settings from '@/settings';
import {FileType} from '@/file-type';
import {TicketService} from '@/ticket/ticket.service';

@Update()
export class AppUpdate {

  constructor(
    private readonly ticketService: TicketService,
  ) { }

  @Use()
  async checkPermissions(
    @Ctx() ctx: HelpdeskContext,
    @Next() next,
  ): Promise<boolean> {
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
  ): Promise<void> {
    await ctx.reply(ctx.from.id + ' ' + ctx.chat.id);
  }

  @Command('cat')
  async sendCurrentCategory(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.sendCurrentCategory(ctx);
  }

  @Command('close')
  async closeTicket(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.closeTicket(ctx);
  }

  @Command('reopen')
  async reopenTicket(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.reopenTicket(ctx);
  }

  @Command('clear')
  async closeAllTickets(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.closeAllTickets(ctx);
  }

  @On([FileType.Photo, FileType.Video, FileType.Document])
  async onPhoto(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.handleMessage(ctx);
  }

  @Hears(/^\/start ?(.*)/)
  async start(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    const category = ctx.match[1];
    await this.ticketService.start(ctx, category);
  }

  @Hears(/^(?!(\/start ))(.+)/)
  async hearsMessages(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.handleMessage(ctx);
  }

  @On('sticker')
  async handleSticker(
    @Ctx() ctx: HelpdeskContext,
  ): Promise<void> {
    await this.ticketService.handleMessage(ctx);
  }
}
