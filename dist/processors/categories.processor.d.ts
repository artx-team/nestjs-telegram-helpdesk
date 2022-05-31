import type { Job } from 'bull';
import { Queue } from 'bull';
import { TicketService } from '@/ticket/ticket.service';
export declare class CategoriesProcessor {
    private readonly q;
    private readonly ticketService;
    constructor(q: Queue, ticketService: TicketService);
    process(job: Job): Promise<void>;
    completed(): Promise<void>;
}
