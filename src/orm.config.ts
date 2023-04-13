import {SnakeNamingStrategy} from 'typeorm-naming-strategies';
import settings from '@/settings';
import {ConnectionOptions} from 'typeorm';

const {db} = settings;
const config: ConnectionOptions = {
  type: 'postgres',
  host: db.host,
  port: db.port,
  username: db.username,
  password: db.password,
  database: db.database,
  entities: db.entities,
  synchronize: false,
  migrationsTableName: 'migration',
  migrations: db.migrations,
  cli: {
    migrationsDir: 'src/migrations',
  },
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
};

export default config;
