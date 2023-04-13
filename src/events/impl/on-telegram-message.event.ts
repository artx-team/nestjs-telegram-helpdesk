import {HelpdeskContext} from '@/helpdesk-context';

export class OnTelegramMessageEvent {
  /**
   * Custom message handlers
   * Handler must return false if it handles message itself
   */
  output: Promise<boolean>[] = [];

  constructor(
    public readonly ctx: HelpdeskContext,
  ) { }

  getResult(): Promise<boolean> {
    return this.output.length
      ? Promise.all(this.output).then(results => results.every(r => r))
      : Promise.resolve(true);
  }
}
