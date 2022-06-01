import {Process, Processor} from '@nestjs/bull';
import {TicketService} from '@/ticket/ticket.service';

export const REMOVE_OLD_TICKETS_QUEUE = 'nestjs-telegram-helpdesk-remove-old-tickets';

@Processor(REMOVE_OLD_TICKETS_QUEUE)
export class RemoveOldTicketsProcessor {

  constructor(
    private readonly ticketService: TicketService,
  ) { }

  @Process()
  async removeOldTickets(): Promise<void> {
    await this.ticketService.removeOldTickets();
    console.log('Old log entries removed');
  }
}
