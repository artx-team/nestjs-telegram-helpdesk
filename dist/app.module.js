"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const app_update_1 = require("./app.update");
const settings_1 = __importDefault(require("./settings"));
const telegraf_postgres_session_1 = __importDefault(require("telegraf-postgres-session"));
const bull_1 = require("@nestjs/bull");
const ticket_service_1 = require("./ticket/ticket.service");
const typeorm_1 = require("@nestjs/typeorm");
const ticket_entity_1 = require("./ticket/ticket.entity");
const orm_module_1 = require("./orm/orm.module");
const message_entity_1 = require("./ticket/message.entity");
const categories_processor_1 = require("./processors/categories.processor");
const app_processor_1 = require("./processors/app.processor");
const { db } = settings_1.default;
const nestjs_i18n_1 = require("nestjs-i18n");
const path_1 = __importDefault(require("path"));
const remove_old_tickets_processor_1 = require("./processors/remove-old-tickets.processor");
const staff_service_1 = require("./staff.service");
let AppModule = class AppModule {
    constructor(q, tQ, staffService) {
        this.q = q;
        this.tQ = tQ;
        this.staffService = staffService;
    }
    async onModuleInit() {
        this.q?.add({}).catch(e => console.log(e));
        if (this.tQ && settings_1.default.tickets?.daysToKeepTickets) {
            const jobs = await this.tQ.getRepeatableJobs();
            await Promise.all(jobs.map(job => this.tQ.removeRepeatableByKey(job.key)));
            await this.tQ.add(null, {
                repeat: {
                    cron: settings_1.default.tickets.removeTicketsCron,
                },
            });
        }
        this.staffService.message('Application started').catch(e => console.log(e));
    }
    async onModuleDestroy() {
        await this.staffService.message('Application stopped').catch(e => console.log(e));
    }
    async onApplicationShutdown(signal) {
        await this.staffService.message('Application shutdown').catch(e => console.log(e));
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            orm_module_1.OrmModule,
            typeorm_1.TypeOrmModule.forFeature([
                ticket_entity_1.Ticket,
                message_entity_1.Message,
            ]),
            ...!settings_1.default.redis ? [] : [
                bull_1.BullModule.forRoot({
                    redis: {
                        host: settings_1.default.redis.host,
                        port: settings_1.default.redis.port,
                    },
                }),
            ],
            ...!settings_1.default.bull ? [] : [
                bull_1.BullModule.registerQueue({ name: settings_1.default.bull.appQueue }, { name: settings_1.default.bull.categoriesQueue }),
            ],
            ...!settings_1.default.tickets ? [] : [
                bull_1.BullModule.registerQueue({ name: remove_old_tickets_processor_1.REMOVE_OLD_TICKETS_QUEUE }),
            ],
            nestjs_telegraf_1.TelegrafModule.forRoot({
                token: settings_1.default.botToken,
                middlewares: [
                    (new telegraf_postgres_session_1.default({
                        user: db.username,
                        host: db.host,
                        database: db.database,
                        password: db.password,
                        port: db.port,
                    })).middleware(),
                ],
            }),
            nestjs_i18n_1.I18nModule.forRoot({
                fallbackLanguage: 'en',
                loaderOptions: {
                    path: path_1.default.join(__dirname, '/i18n/'),
                },
                loader: nestjs_i18n_1.I18nYamlLoader,
            }),
        ],
        providers: [
            app_update_1.AppUpdate,
            staff_service_1.StaffService,
            ticket_service_1.TicketService,
            ...!settings_1.default.bull ? [] : [
                categories_processor_1.CategoriesProcessor,
                app_processor_1.AppProcessor,
            ],
            ...!settings_1.default.tickets ? [] : [
                remove_old_tickets_processor_1.RemoveOldTicketsProcessor,
            ],
        ],
    }),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, bull_1.InjectQueue)(settings_1.default.bull?.appQueue)),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, bull_1.InjectQueue)(remove_old_tickets_processor_1.REMOVE_OLD_TICKETS_QUEUE)),
    __metadata("design:paramtypes", [Object, Object, staff_service_1.StaffService])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map