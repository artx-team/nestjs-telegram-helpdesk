import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {I18nService} from 'nestjs-i18n';
import {InjectBot} from 'nestjs-telegraf';
import {Telegraf, TelegramError} from 'telegraf';
import type {User} from 'typegram/manage';
import {Repository, Raw} from 'typeorm';
import {UpdateResult} from 'typeorm/query-builder/result/UpdateResult';

import {SupportCategory} from '@/dto/support-category';
import {HelpdeskContext} from '@/helpdesk-context';
import settings from '@/settings';
import {Message} from '@/ticket/message.entity';
import {TicketStatus} from '@/ticket/ticket-status';
import {Ticket} from '@/ticket/ticket.entity';



@Injectable()
export class TicketService {
  static readonly ticketMessageRegExp = /#T(\d+)/;

  private static escapeChars = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
  };

  private static escapeCharsRegExp = new RegExp('[' + Object.keys(TicketService.escapeChars).join('') + ']', 'g');

  static escapeSpecialChars(input: string): string {
    return input.replaceAll(TicketService.escapeCharsRegExp, key => TicketService.escapeChars[key]);
  }

  /**
   * Extract text from different types of messages
   * @param ctx
   * @private
   */
  private static getMessageText(ctx: HelpdeskContext): string {
    if ('text' in ctx.message) {
      return ctx.message.text;
    } else if ('sticker' in ctx.message) {
      return  ctx.message.sticker.emoji;
    } else if ('photo' in ctx.message || 'video' in ctx.message || 'document' in ctx.message) {
      return  ctx.message.caption ?? '';
    }

    return '';
  }

  categories: SupportCategory[] = settings.categories ?? [];

  constructor(
    @InjectBot() private readonly bot: Telegraf<HelpdeskContext>,
    @InjectRepository(Ticket) private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
    private readonly i18n: I18nService,
  ) { }

  /**
   * Start command handler
   * @param ctx
   * @param categoryId
   */
  async start(ctx: HelpdeskContext, categoryId: string | null): Promise<void> {
    if (this.categories.length <= 1) {
      return;
    }

    const category = this.getCategory(categoryId);

    if (category) {
      ctx.session.categoryId = category.id;
      await this.sendCurrentCategory(ctx);
    } else {
      delete ctx.session.categoryId;
      await this.sendPublicLinks(ctx);
    }
  }

  /**
   * Send message with current category
   * @param ctx
   */
  async sendCurrentCategory(ctx: HelpdeskContext): Promise<void> {
    const category = this.getCategory(ctx.session.categoryId);

    if (category) {
      await ctx.reply(
        await this.i18n.t(`message.selected group`, {
          lang: ctx.message.from.language_code,
          args: {
            name: category.name,
          },
        }),
        {parse_mode: 'HTML'},
      );
    } else {
      await ctx.reply(
        await this.i18n.t(`message.no group selected`, {
          lang: ctx.message.from.language_code,
        }),
        {parse_mode: 'HTML'},
      );
      await this.sendPublicLinks(ctx);
    }
  }

  /**
   * Handle any message
   * @param ctx
   */
  async handleMessage(ctx: HelpdeskContext): Promise<void> {
    try {
      if (ctx.chat.type === 'private') {
        await this.userChat(ctx);
      } else {
        await this.staffChat(ctx);
      }
    } catch (e: unknown) {
      // send error message to staff chat
      if (e instanceof TelegramError) {
        this.bot.telegram.sendMessage(
          settings.staffChatId,
          e.message + '\n\n' + JSON.stringify(e.on, null, 2),
          {parse_mode: 'HTML'},
        ).catch(e => {
          console.log(e);
        });
      } else {
        console.log(e);
      }
    }
  }

  /**
   * Close ticket
   * @param ctx
   */
  async closeTicket(ctx: HelpdeskContext): Promise<void> {
    if (!ctx.session.admin) {
      return;
    }

    const ticket = await this.findTicketOrReplyNotFound(ctx);

    if (ticket == null) {
      return;
    }

    await this.updateTicketStatus(ticket.id, TicketStatus.Closed);
  }

  /**
   * Reopen ticket
   * @param ctx
   */
  async reopenTicket(ctx: HelpdeskContext): Promise<void> {
    if (!ctx.session.admin) {
      return;
    }

    const ticket = await this.findTicketOrReplyNotFound(ctx, TicketStatus.Closed);

    if (ticket == null) {
      return;
    }

    await this.updateTicketStatus(ticket.id, TicketStatus.Open);
  }

  /**
   * Close all tickets in all categories from staff chat; otherwise close all tickets in category
   * @param ctx
   */
  async closeAllTickets(ctx: HelpdeskContext): Promise<void> {
    if (!ctx.session.admin) {
      return;
    }

    if (ctx.chat.id.toString() !== settings.staffChatId) {
      const category = this.categories.find(c => c.groupId === ctx.chat.id.toString());
      if (!category) {
        return;
      }
      await this.ticketRepository.update(
        {
          category: category.id,
          status: TicketStatus.Open,
        },
        {
          status: TicketStatus.Closed,
        },
      );
    } else {
      await this.ticketRepository.update(
        {
          status: TicketStatus.Open,
        },
        {
          status: TicketStatus.Closed,
        },
      );
    }

    ctx.reply(
      await this.i18n.t(`message.all open tickets closed`, {
        lang: ctx.message.from.language_code,
      }),
      {parse_mode: 'HTML'},
    );
  }

  async removeOldTickets(): Promise<void> {
    const sql = this.ticketRepository
      .createQueryBuilder('ticket')
      .delete()
      .where('now() - created_at > :days::interval', {
        days: `${settings.tickets.daysToKeepTickets} days`,
        status: TicketStatus.Closed,
      });

    await sql.execute();
  }

  /**
   * Get category by id
   * @param categoryId
   * @private
   */
  private getCategory(categoryId: string): SupportCategory | null {
    return this.categories.length > 0 ?
      this.categories.find(c => c.id === categoryId) :
      new SupportCategory({
        id: settings.staffChatId,
        groupId: settings.staffChatId,
        name: 'default',
        isPublic: false,
      });
  }

  /**
   * Handle user's message
   * @param ctx
   * @private
   */
  private async userChat(ctx: HelpdeskContext): Promise<void> {
    // auto select single category
    if (ctx.session.categoryId == null && this.categories.length === 1) {
      ctx.session.categoryId = this.categories[0].id;
    } else if (ctx.session.categoryId == null && this.categories.length === 0) {
      ctx.session.categoryId = settings.staffChatId;
    }

    const category = this.getCategory(ctx.session.categoryId);

    // if no category, send public links
    if (!category) {
      await this.sendCurrentCategory(ctx);
      return;
    }

    let ticket = await this.ticketRepository.findOne({
      userId: ctx.message.from.id.toString(),
      status: TicketStatus.Open,
      category: category.id,
    });

    // create ticket if not found
    if (ticket == null) {
      ticket = await this.ticketRepository.save(
        this.ticketRepository.create({
          userId: ctx.message.from.id.toString(),
          status: TicketStatus.Open,
          category: category.id,
          categoryName: category.name,
        }),
      );
    } else {
      const messageCount = await this.checkSpam(ticket.id, ctx.message.from.id.toString());
      if (messageCount >= settings.spamCantMsg) {
        ctx.reply(
          await this.i18n.t(`message.stop spam`, {
            lang: ctx.message.from.language_code,
          }),
        );
        return;
      }
    }

    // get text from message
    const originalMessage = TicketService.getMessageText(ctx);

    // create message in database
    await this.createMessage(ticket.id, originalMessage, ctx.message.from);

    let username = `${TicketService.escapeSpecialChars(ctx.message.from.first_name)}`;
    if (ctx.message.from.last_name) {
      username += ` ${TicketService.escapeSpecialChars(ctx.message.from.last_name)}`;
    }
    if (!settings.anonymousTickets) {
      username = `<a href="tg://user?id=${ctx.message.from.id}">${username}</a>`;
    }

    const message = await this.i18n.t(`message.ticket from`, {
      lang: ctx.message.from.language_code,
      args: {
        id: `#T${ticket.id.toString().padStart(6, '0')}`,
        username,
        lang: ctx.message.from.language_code,
        message: TicketService.escapeSpecialChars(originalMessage),
      },
    });

    // send ticket message to main staff chat
    await this.sendMessage(settings.staffChatId, message, ctx, true);

    // send ticket message to selected group
    if (category.groupId !== settings.staffChatId) {
      await this.sendMessage(category.groupId, message, ctx, true);
    }
  }

  /**
   * Handle a message in the staff chat
   * @param ctx
   * @private
   */
  private async staffChat(ctx: HelpdeskContext): Promise<void> {
    if (!ctx.session.admin) {
      return;
    }

    const ticket = await this.findTicketOrReplyNotFound(ctx);

    if (ticket == null) {
      return;
    }

    const message = TicketService.getMessageText(ctx);

    // create message in database
    await this.createMessage(ticket.id, message, ctx.message.from);

    // send message to user
    await this.sendMessage(ticket.userId, message, ctx);

    if (settings.autoCloseTickets) {
      await this.updateTicketStatus(ticket.id, TicketStatus.Closed);
    }
  }

  /**
   * Find ticket id from message and fetch it from db, or reply of it is not found
   * @param ctx
   * @param status
   * @private
   */
  private async findTicketOrReplyNotFound(ctx: HelpdeskContext, status = TicketStatus.Open): Promise<Ticket | null> {
    // if someone does not reply or replies not to the bot
    if (ctx.message == null || !('reply_to_message' in ctx.message) || ctx.message.reply_to_message == null || ctx.message.reply_to_message.from.id !== this.bot.botInfo.id) {
      return null;
    }

    // find text in message
    const replyText = ('text' in ctx.message.reply_to_message ? ctx.message.reply_to_message.text : null)
      ?? ('caption' in ctx.message.reply_to_message ? ctx.message.reply_to_message.caption : '');

    // find ticket id in message text
    const ticketId = replyText.match(TicketService.ticketMessageRegExp)?.[1];
    if (ticketId == null) {
      const message = await this.i18n.t(
        `message.Ticket id not found in message`,
        {
          lang: ctx.message.from.language_code,
        },
      );
      await ctx.reply(message, {reply_to_message_id: ctx.message.message_id});
      return null;
    }

    // find ticket in database
    const ticket = await this.ticketRepository.findOne({
      id: Number(ticketId),
    });

    // if ticket not found in database
    if (ticket == null) {
      const message = await this.i18n.t(
        `message.Ticket with id not found`,
        {
          lang: ctx.message.from.language_code,
          args: {
            ticketId,
          },
        },
      );
      await ctx.reply(message, {reply_to_message_id: ctx.message.message_id});
      return null;
    }

    // if ticket is not of desired status
    if (ticket.status !== status) {
      const message = await this.i18n.t(
        `message.Ticket is ticketStatus, not status`,
        {
          lang: ctx.message.from.language_code,
          args: {
            ticketStatus: ticket.status,
            status,
          },
        },
      );
      await ctx.reply(message, {reply_to_message_id: ctx.message.message_id});
      return null;
    }

    return ticket;
  }

  /**
   * Update ticket status by id
   * @param ticketId
   * @param status
   * @private
   */
  private updateTicketStatus(ticketId: number, status: TicketStatus): Promise<UpdateResult> {
    return this.ticketRepository.update({id: ticketId}, {status});
  }

  /**
   * Store message in database
   * @param ticketId
   * @param message
   * @param from
   * @private
   */
  private createMessage(ticketId: number, message: string, from: User): Promise<Message> {
    return this.messageRepository.save(
      this.messageRepository.create({
        ticketId,
        senderId: from.id.toString(),
        senderName: `${from.first_name} ${from.last_name ?? ''} ${from.username != null ? `(@${from.username})` : ''}`,
        message,
      }),
    );
  }

  /**
   * Message forwarding
   * @param chatId
   * @param message
   * @param ctx
   * @param forceSendTextMessage
   * @private
   */
  private async sendMessage(chatId: string, message: string, ctx: HelpdeskContext, forceSendTextMessage = false): Promise<void> {
    if ('text' in ctx.message || 'sticker' in ctx.message && forceSendTextMessage) {
      await this.bot.telegram.sendMessage(
        chatId,
        message,
        {parse_mode: 'HTML'},
      );
    }

    if ('sticker' in ctx.message) {
      await this.bot.telegram.sendSticker(
        chatId,
        ctx.message.sticker.file_id,
      );
    } else if ('photo' in ctx.message) {
      await this.bot.telegram.sendPhoto(
        chatId,
        ctx.message.photo[0].file_id,
        {caption: message, parse_mode: 'HTML'},
      );
    } else if ('video' in ctx.message) {
      await this.bot.telegram.sendVideo(
        chatId,
        ctx.message.video.file_id,
        {caption: message, parse_mode: 'HTML'},
      );
    } else if ('document' in ctx.message) {
      await this.bot.telegram.sendDocument(
        chatId,
        ctx.message.document.file_id,
        {caption: message, parse_mode: 'HTML'},
      );
    }
  }

  /**
   * If no support category selected, send public categories
   * @param ctx
   * @private
   */
  private async sendPublicLinks(ctx: HelpdeskContext): Promise<any> {
    const links = this.categories
      .filter(cat => cat.isPublic)
      .map(cat => `<a href="https://t.me/${this.bot.botInfo.username}?start=${cat.id}">${cat.name}</a>`);
    if (links.length > 0) {
      const message = await this.i18n.t(
        `message.Public groups`,
        {
          lang: ctx.message.from.language_code,
          args: {
            links: links.join('\n'),
          },
        },
      );
      return ctx.reply(message, {parse_mode: 'HTML'});
    }

    return Promise.resolve();
  }

  /**
   * Count messages in ticket in last {settings.spamTime} minutes
   * @param ticketId
   * @param senderId
   * @private
   */
  private async checkSpam(ticketId: number, senderId: string): Promise<number> {
    const messages = await this.messageRepository
      .createQueryBuilder('m')
      .select('sender_id')
      .where({
        ticketId,
        createdAt: Raw(alias => `${alias} >= now()::date - interval ':1 minutes'`, [settings.spamTime]),
      })
      .orderBy({created_at: 'DESC'})
      .getRawMany();

    let count = 0;
    for (const sender of messages) {
      if (sender.sender_id === senderId) {
        count++;
      } else {
        break;
      }
    }

    return count;
  }
}
