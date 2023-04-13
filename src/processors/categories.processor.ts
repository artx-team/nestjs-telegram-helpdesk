import {
  OnGlobalQueueCompleted,
  Processor,
  Process, InjectQueue,
} from '@nestjs/bull';
import {Optional} from '@nestjs/common';
import type {Job} from 'bull';
import {Queue} from 'bull';
import {plainToInstance} from 'class-transformer';
import {validateSync} from 'class-validator';

import {SupportCategory} from '@/dto/support-category';
import settings from '@/settings';
import {TicketService} from '@/ticket/ticket.service';




@Processor(settings.bull?.categoriesQueue)
export class CategoriesProcessor {

  constructor(
    @Optional() @InjectQueue(settings.bull?.categoriesQueue) private readonly q: Queue,
    private readonly ticketService: TicketService,
  ) { }

  @Process()
  async process(job: Job): Promise<void> {
    if (Array.isArray(job.data)) {
      this.ticketService.categories = job.data.map(c => {
        const cat = plainToInstance(SupportCategory, c);
        const errors = validateSync(cat);

        if (errors.length) {
          console.log(errors);
          throw new Error(errors.map(e => e.toString()).join('\n'));
        }
        return cat;
      });
    }
  }

  @OnGlobalQueueCompleted()
  async completed(): Promise<void> {
    this.q.clean(0, 'completed');
  }
}
