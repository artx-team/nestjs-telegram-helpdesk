"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_naming_strategies_1 = require("typeorm-naming-strategies");
const settings_1 = __importDefault(require("./settings"));
const { db } = settings_1.default;
const config = {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    migrationsTableName: 'migration',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    cli: {
        migrationsDir: 'src/migrations',
    },
    logging: false,
    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy(),
};
exports.default = config;
//# sourceMappingURL=orm.config.js.map