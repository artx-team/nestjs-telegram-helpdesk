import { TicketStatus } from '@/ticket/ticket-status';
export declare class Ticket {
    id?: number;
    uuid: string;
    category: string;
    categoryName?: string;
    userId: string;
    status: TicketStatus;
    createdAt: Date;
    updatedAt: Date;
}
