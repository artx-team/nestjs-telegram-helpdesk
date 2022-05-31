import { Context } from 'telegraf';
export declare type HelpdeskContext = Context & {
    match: RegExpMatchArray;
    session: {
        admin?: boolean;
        groupAdmin?: string;
        categoryId?: string;
    };
};
