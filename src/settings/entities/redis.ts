import {IsInt, IsString} from 'class-validator';

export class Redis {
  @IsString()
  host: string;

  @IsInt()
  port: number;
}
