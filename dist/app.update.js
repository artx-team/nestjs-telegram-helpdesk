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
exports.AppUpdate = void 0;
const nestjs_telegraf_1 = require("nestjs-telegraf");
const settings_1 = __importDefault(require("./settings"));
const file_type_1 = require("./file-type");
const ticket_service_1 = require("./ticket/ticket.service");
let AppUpdate = class AppUpdate {
    constructor(ticketService) {
        this.ticketService = ticketService;
    }
    async checkPermissions(ctx, next) {
        if (ctx.session.categoryId && !this.ticketService.categories.some(c => c.id === ctx.session.categoryId)) {
            delete ctx.session.categoryId;
        }
        if (ctx.session.groupAdmin && ctx.chat.type == 'private') {
            delete ctx.session.groupAdmin;
        }
        if (this.ticketService.categories.length > 0) {
            ctx.session.groupAdmin = this.ticketService.categories.find(cat => cat.groupId === ctx.chat.id.toString())?.groupId;
        }
        ctx.session.admin = ctx.chat.id.toString() === settings_1.default.staffChatId || !!ctx.session.groupAdmin;
        if (ctx.session.admin) {
            console.log('Permission granted for ' + ctx.from.username);
        }
        return next();
    }
    async findId(ctx) {
        await ctx.reply(ctx.from.id + ' ' + ctx.chat.id);
    }
    async sendCurrentCategory(ctx) {
        await this.ticketService.sendCurrentCategory(ctx);
    }
    async closeTicket(ctx) {
        await this.ticketService.closeTicket(ctx);
    }
    async reopenTicket(ctx) {
        await this.ticketService.reopenTicket(ctx);
    }
    async closeAllTickets(ctx) {
        await this.ticketService.closeAllTickets(ctx);
    }
    async onPhoto(ctx) {
        await this.ticketService.handleMessage(ctx);
    }
    async start(ctx) {
        const category = ctx.match[1];
        await this.ticketService.start(ctx, category);
    }
    async hearsMessages(ctx) {
        await this.ticketService.handleMessage(ctx);
    }
    async handleSticker(ctx) {
        await this.ticketService.handleMessage(ctx);
    }
};
__decorate([
    (0, nestjs_telegraf_1.Use)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __param(1, (0, nestjs_telegraf_1.Next)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "checkPermissions", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('id'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "findId", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('cat'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "sendCurrentCategory", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('close'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "closeTicket", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('reopen'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "reopenTicket", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('clear'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "closeAllTickets", null);
__decorate([
    (0, nestjs_telegraf_1.On)([file_type_1.FileType.Photo, file_type_1.FileType.Video, file_type_1.FileType.Document]),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "onPhoto", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)(/^\/start ?(.*)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "start", null);
__decorate([
    (0, nestjs_telegraf_1.Hears)(/^(?!(\/start ))(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "hearsMessages", null);
__decorate([
    (0, nestjs_telegraf_1.On)('sticker'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppUpdate.prototype, "handleSticker", null);
AppUpdate = __decorate([
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [ticket_service_1.TicketService])
], AppUpdate);
exports.AppUpdate = AppUpdate;
//# sourceMappingURL=app.update.js.map