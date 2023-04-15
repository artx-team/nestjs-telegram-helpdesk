import {HelpdeskContext} from '@/helpdesk-context';

export type MessageAndWeight = {message: string, weight: number};

export class OnMessageToStaffEvent {
  /**
   * Custom message handlers
   * Handler must return message and weight
   * Message with maximal weight will be returned
   */
  output: Promise<MessageAndWeight>[] = [];

  constructor(
    public readonly ticketId: string,
    public readonly username: string,
    public readonly ctx: HelpdeskContext,
  ) { }

  getResult(): Promise<string | null> {
    return this.output.length
      ? Promise.all(this.output).then(results => (results.sort((a, b) => b.weight - a.weight))[0].message)
      : Promise.resolve(null);
  }
}
