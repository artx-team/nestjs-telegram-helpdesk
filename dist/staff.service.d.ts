import { HelpdeskContext } from '@/helpdesk-context';
import { Telegraf } from 'telegraf';
export declare class StaffService {
    private readonly bot;
    constructor(bot: Telegraf<HelpdeskContext>);
    message(message: string): Promise<any>;
}
