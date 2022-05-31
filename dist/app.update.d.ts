import { HelpdeskContext } from '@/helpdesk-context';
import { TicketService } from '@/ticket/ticket.service';
export declare class AppUpdate {
    private readonly ticketService;
    constructor(ticketService: TicketService);
    checkPermissions(ctx: HelpdeskContext, next: any): Promise<boolean>;
    findId(ctx: HelpdeskContext): Promise<void>;
    sendCurrentCategory(ctx: HelpdeskContext): Promise<void>;
    closeTicket(ctx: HelpdeskContext): Promise<void>;
    reopenTicket(ctx: HelpdeskContext): Promise<void>;
    closeAllTickets(ctx: HelpdeskContext): Promise<void>;
    onPhoto(ctx: HelpdeskContext): Promise<void>;
    start(ctx: HelpdeskContext): Promise<void>;
    hearsMessages(ctx: HelpdeskContext): Promise<void>;
    handleSticker(ctx: HelpdeskContext): Promise<void>;
}
