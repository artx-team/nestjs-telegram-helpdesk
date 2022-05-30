export class SupportCategory {
  id: string;

  name: string;

  groupId: string;

  isPublic: boolean;

  constructor(v?: Partial<SupportCategory>) {
    Object.assign(this, v);
  }
}
