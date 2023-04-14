import {Type} from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import {SupportCategory} from '@/dto/support-category';
import {BullSettings} from '@/settings/entities/bull-settings';
import {Db} from '@/settings/entities/db';
import {Redis} from '@/settings/entities/redis';
import {TicketSettings} from '@/settings/entities/ticket-settings';

/**
 * Application settings
 * See settings.example.yml
 */
export class Settings {
  @Type(() => Db)
  @ValidateNested()
  @IsObject()
  db: Db;

  @Type(() => TicketSettings)
  @ValidateNested()
  @IsObject()
  @IsOptional()
  tickets?: TicketSettings;

  @Type(() => Redis)
  @ValidateNested()
  @IsObject()
  @ValidateIf(o => !!o.tickets)
  redis?: Redis;

  @Type(() => BullSettings)
  @ValidateNested()
  @ValidateIf(o => !!o.redis)
  bull?: BullSettings;

  @IsString()
  botToken: string;

  @IsString()
  staffChatId: string;

  @IsString()
  ownerId: string;

  @Min(0)
  @IsInt()
  spamTime: number;

  @Min(0)
  @IsInt()
  spamCantMsg: number;

  @IsBoolean()
  allowPrivate: boolean;

  @IsBoolean()
  directReply: boolean;

  @IsBoolean()
  autoCloseTickets: boolean;

  @IsBoolean()
  anonymousTickets: boolean;

  @Type(() => SupportCategory)
  @ValidateNested({each: true})
  @IsOptional()
  categories?: SupportCategory[];

  @IsString({each: true})
  @IsArray()
  plugins: string[];

  @IsString({each: true})
  @IsArray()
  i18n: string[];
}
