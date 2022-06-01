import { TicketService } from '@/ticket/ticket.service';
export declare const REMOVE_OLD_TICKETS_QUEUE = "nestjs-telegram-helpdesk-remove-old-tickets";
export declare class RemoveOldTicketsProcessor {
    private readonly ticketService;
    constructor(ticketService: TicketService);
    removeOldTickets(): Promise<void>;
}
