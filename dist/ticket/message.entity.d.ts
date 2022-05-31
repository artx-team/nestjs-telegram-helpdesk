import { Ticket } from '@/ticket/ticket.entity';
export declare class Message {
    id?: number;
    uuid: string;
    ticketId: number;
    senderId: string;
    senderName: string;
    ticket: Ticket;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}
