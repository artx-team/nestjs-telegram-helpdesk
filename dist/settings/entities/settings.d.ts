import { Db } from '@/settings/entities/db';
import { Redis } from '@/settings/entities/redis';
import { BullSettings } from '@/settings/entities/bull-settings';
import { SupportCategory } from '@/dto/support-category';
import { TicketSettings } from '@/settings/entities/ticket-settings';
export declare class Settings {
    db: Db;
    tickets?: TicketSettings;
    redis?: Redis;
    bull?: BullSettings;
    botToken: string;
    staffChatId: string;
    ownerId: string;
    spamTime: number;
    spamCantMsg: number;
    allowPrivate: boolean;
    directReply: boolean;
    autoCloseTickets: boolean;
    anonymousTickets: boolean;
    categories?: SupportCategory[];
}
