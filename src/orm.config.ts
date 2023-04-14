import {DataSourceOptions} from 'typeorm';
import {SnakeNamingStrategy} from 'typeorm-naming-strategies';

import settings from '@/settings';

const {db} = settings;

const config: DataSourceOptions = {
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  entities: [
    __dirname + '/**/*.entity{.ts,.js}',
    ...db.entities,
  ],
  synchronize: false,
  migrationsTableName: 'migration',
  migrations: [
    __dirname + '/migrations/**/*{.ts,.js}',
    ...db.migrations,
  ],
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
};

export default config;
