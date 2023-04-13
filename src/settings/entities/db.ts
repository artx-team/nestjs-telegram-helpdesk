import {IsArray, IsInt, IsString, IsUrl} from 'class-validator';

export class Db {
  @IsUrl({require_tld: false})
  host: string;

  @IsInt()
  port: number;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  database: string;

  @IsString({each: true})
  @IsArray()
  migrations: string[];

  @IsString({each: true})
  @IsArray()
  entities: string[];
}
