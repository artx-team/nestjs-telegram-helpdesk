import {IsBoolean, IsInt, IsObject, IsOptional, IsString, Min, ValidateIf, ValidateNested} from 'class-validator';
import {Type} from 'class-transformer';
import {Db} from '@/settings/entities/db';
import {Redis} from '@/settings/entities/redis';
import {BullSettings} from '@/settings/entities/bull-settings';
import {SupportCategory} from '@/dto/support-category';

/**
 * Application settings
 * See settings.example.yml
 */
export class Settings {
  @Type(() => Db)
  @ValidateNested()
  @IsObject()
  db: Db;

  @Type(() => Redis)
  @ValidateNested()
  @IsObject()
  @IsOptional()
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
}
