import {Context} from 'telegraf';

export type HelpdeskContext = Context & {
  match: RegExpMatchArray;
  session: {
    admin?: boolean;
    groupAdmin?: string;
    categoryId?: string;
  };
}
