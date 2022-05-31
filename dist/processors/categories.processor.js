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
exports.CategoriesProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const settings_1 = __importDefault(require("../settings"));
const ticket_service_1 = require("../ticket/ticket.service");
const class_transformer_1 = require("class-transformer");
const support_category_1 = require("../dto/support-category");
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
let CategoriesProcessor = class CategoriesProcessor {
    constructor(q, ticketService) {
        this.q = q;
        this.ticketService = ticketService;
    }
    async process(job) {
        if (Array.isArray(job.data)) {
            this.ticketService.categories = job.data.map(c => {
                const cat = (0, class_transformer_1.plainToInstance)(support_category_1.SupportCategory, c);
                const errors = (0, class_validator_1.validateSync)(cat);
                if (errors.length) {
                    console.log(errors);
                    throw new Error(errors.map(e => e.toString()).join('\n'));
                }
                return cat;
            });
        }
    }
    async completed() {
        this.q.clean(0, 'completed');
    }
};
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoriesProcessor.prototype, "process", null);
__decorate([
    (0, bull_1.OnGlobalQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesProcessor.prototype, "completed", null);
CategoriesProcessor = __decorate([
    (0, bull_1.Processor)(settings_1.default.bull?.categoriesQueue),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, bull_1.InjectQueue)(settings_1.default.bull?.categoriesQueue)),
    __metadata("design:paramtypes", [Object, ticket_service_1.TicketService])
], CategoriesProcessor);
exports.CategoriesProcessor = CategoriesProcessor;
//# sourceMappingURL=categories.processor.js.map