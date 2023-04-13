import {IsCron} from '@kovalenko/is-cron';
import {IsInt, Min, ValidateIf} from 'class-validator';

export class TicketSettings {
  @Min(0)
  @IsInt()
  daysToKeepTickets: number;

  @IsCron()
  @ValidateIf(o => o.daysToKeepTickets > 0)
  removeTicketsCron: string;
}
