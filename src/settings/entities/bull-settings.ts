import {IsString} from 'class-validator';

export class BullSettings {
  @IsString()
  categoriesQueue: string;

  @IsString()
  appQueue: string;
}
