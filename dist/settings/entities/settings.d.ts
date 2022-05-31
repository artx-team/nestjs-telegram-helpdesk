import { Db } from '@/settings/entities/db';
import { Redis } from '@/settings/entities/redis';
import { BullSettings } from '@/settings/entities/bull-settings';
import { SupportCategory } from '@/dto/support-category';
export declare class Settings {
    db: Db;
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
