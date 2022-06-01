import { SupportCategory } from '@/dto/support-category';
import { HelpdeskContext } from '@/helpdesk-context';
import { Ticket } from '@/ticket/ticket.entity';
import { Repository } from 'typeorm';
import { Telegraf } from 'telegraf';
import { Message } from '@/ticket/message.entity';
import { I18nService } from 'nestjs-i18n';
export declare class TicketService {
    private readonly bot;
    private readonly ticketRepository;
    private readonly messageRepository;
    private readonly i18n;
    static readonly ticketMessageRegExp: RegExp;
    private static escapeChars;
    private static escapeCharsRegExp;
    categories: SupportCategory[];
    constructor(bot: Telegraf<HelpdeskContext>, ticketRepository: Repository<Ticket>, messageRepository: Repository<Message>, i18n: I18nService);
    static escapeSpecialChars(input: string): string;
    private static getMessageText;
    start(ctx: HelpdeskContext, categoryId: string | null): Promise<void>;
    sendCurrentCategory(ctx: HelpdeskContext): Promise<void>;
    handleMessage(ctx: HelpdeskContext): Promise<void>;
    closeTicket(ctx: HelpdeskContext): Promise<void>;
    reopenTicket(ctx: HelpdeskContext): Promise<void>;
    closeAllTickets(ctx: HelpdeskContext): Promise<void>;
    removeOldTickets(): Promise<void>;
    private getCategory;
    private userChat;
    private staffChat;
    private findTicketOrReplyNotFound;
    private updateTicketStatus;
    private createMessage;
    private sendMessage;
    private sendPublicLinks;
    private checkSpam;
}
