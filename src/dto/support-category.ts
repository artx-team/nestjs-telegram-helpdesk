import {IsBoolean, IsNumberString, IsString} from 'class-validator';

export class SupportCategory {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumberString()
  groupId: string;

  @IsBoolean()
  isPublic: boolean;

  constructor(v?: Partial<SupportCategory>) {
    Object.assign(this, v);
  }
}
