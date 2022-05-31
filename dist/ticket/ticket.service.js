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
var TicketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const common_1 = require("@nestjs/common");
const support_category_1 = require("../dto/support-category");
const typeorm_1 = require("@nestjs/typeorm");
const ticket_entity_1 = require("./ticket.entity");
const typeorm_2 = require("typeorm");
const ticket_status_1 = require("./ticket-status");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const settings_1 = __importDefault(require("../settings"));
const message_entity_1 = require("./message.entity");
const nestjs_i18n_1 = require("nestjs-i18n");
let TicketService = TicketService_1 = class TicketService {
    constructor(bot, ticketRepository, messageRepository, i18n) {
        this.bot = bot;
        this.ticketRepository = ticketRepository;
        this.messageRepository = messageRepository;
        this.i18n = i18n;
        this.categories = settings_1.default.categories ?? [];
    }
    static escapeSpecialChars(input) {
        return input.replaceAll(TicketService_1.escapeCharsRegExp, key => TicketService_1.escapeChars[key]);
    }
    static getMessageText(ctx) {
        if ('text' in ctx.message) {
            return ctx.message.text;
        }
        else if ('sticker' in ctx.message) {
            return ctx.message.sticker.emoji;
        }
        else if ('photo' in ctx.message || 'video' in ctx.message || 'document' in ctx.message) {
            return ctx.message.caption ?? '';
        }
        return '';
    }
    async start(ctx, categoryId) {
        if (this.categories.length <= 1) {
            return;
        }
        const category = this.getCategory(categoryId);
        if (category) {
            ctx.session.categoryId = category.id;
            await this.sendCurrentCategory(ctx);
        }
        else {
            delete ctx.session.categoryId;
            await this.sendPublicLinks(ctx);
        }
    }
    async sendCurrentCategory(ctx) {
        const category = this.getCategory(ctx.session.categoryId);
        if (category) {
            await ctx.reply(await this.i18n.t(`message.selected group`, {
                lang: ctx.message.from.language_code,
                args: {
                    name: category.name,
                },
            }), { parse_mode: 'HTML' });
        }
        else {
            await ctx.reply(await this.i18n.t(`message.no group selected`, {
                lang: ctx.message.from.language_code,
            }), { parse_mode: 'HTML' });
            await this.sendPublicLinks(ctx);
        }
    }
    async handleMessage(ctx) {
        try {
            if (ctx.chat.type === 'private') {
                await this.userChat(ctx);
            }
            else {
                await this.staffChat(ctx);
            }
        }
        catch (e) {
            if (e instanceof telegraf_1.TelegramError) {
                this.bot.telegram.sendMessage(settings_1.default.staffChatId, e.message + '\n\n' + JSON.stringify(e.on, null, 2), { parse_mode: 'HTML' }).catch(e => {
                    console.log(e);
                });
            }
            else {
                console.log(e);
            }
        }
    }
    async closeTicket(ctx) {
        if (!ctx.session.admin) {
            return;
        }
        const ticket = await this.findTicketOrReplyNotFound(ctx);
        if (ticket == null) {
            return;
        }
        await this.updateTicketStatus(ticket.id, ticket_status_1.TicketStatus.Closed);
    }
    async reopenTicket(ctx) {
        if (!ctx.session.admin) {
            return;
        }
        const ticket = await this.findTicketOrReplyNotFound(ctx, ticket_status_1.TicketStatus.Closed);
        if (ticket == null) {
            return;
        }
        await this.updateTicketStatus(ticket.id, ticket_status_1.TicketStatus.Open);
    }
    async closeAllTickets(ctx) {
        if (!ctx.session.admin) {
            return;
        }
        if (ctx.chat.id.toString() !== settings_1.default.staffChatId) {
            const category = this.categories.find(c => c.groupId === ctx.chat.id.toString());
            if (!category) {
                return;
            }
            await this.ticketRepository.update({
                category: category.id,
                status: ticket_status_1.TicketStatus.Open,
            }, {
                status: ticket_status_1.TicketStatus.Closed,
            });
        }
        else {
            await this.ticketRepository.update({
                status: ticket_status_1.TicketStatus.Open,
            }, {
                status: ticket_status_1.TicketStatus.Closed,
            });
        }
        ctx.reply(await this.i18n.t(`message.all open tickets closed`, {
            lang: ctx.message.from.language_code,
        }), { parse_mode: 'HTML' });
    }
    getCategory(categoryId) {
        return this.categories.length > 0 ?
            this.categories.find(c => c.id === categoryId) :
            new support_category_1.SupportCategory({
                id: settings_1.default.staffChatId,
                groupId: settings_1.default.staffChatId,
                name: 'default',
                isPublic: false,
            });
    }
    async userChat(ctx) {
        if (ctx.session.categoryId == null && this.categories.length === 1) {
            ctx.session.categoryId = this.categories[0].id;
        }
        else if (ctx.session.categoryId == null && this.categories.length === 0) {
            ctx.session.categoryId = settings_1.default.staffChatId;
        }
        const category = this.getCategory(ctx.session.categoryId);
        if (!category) {
            await this.sendCurrentCategory(ctx);
            return;
        }
        let ticket = await this.ticketRepository.findOne({
            userId: ctx.message.from.id.toString(),
            status: ticket_status_1.TicketStatus.Open,
            category: category.id,
        });
        if (ticket == null) {
            ticket = await this.ticketRepository.save(this.ticketRepository.create({
                userId: ctx.message.from.id.toString(),
                status: ticket_status_1.TicketStatus.Open,
                category: category.id,
                categoryName: category.name,
            }));
        }
        else {
            const messageCount = await this.checkSpam(ticket.id, ctx.message.from.id.toString());
            if (messageCount >= settings_1.default.spamCantMsg) {
                ctx.reply(await this.i18n.t(`message.stop spam`, {
                    lang: ctx.message.from.language_code,
                }));
                return;
            }
        }
        const originalMessage = TicketService_1.getMessageText(ctx);
        await this.createMessage(ticket.id, originalMessage, ctx.message.from);
        let username = `${TicketService_1.escapeSpecialChars(ctx.message.from.first_name)}`;
        if (ctx.message.from.last_name) {
            username += ` ${TicketService_1.escapeSpecialChars(ctx.message.from.last_name)}`;
        }
        if (!settings_1.default.anonymousTickets) {
            username = `<a href="tg://user?id=${ctx.message.from.id}">${username}</a>`;
        }
        const message = await this.i18n.t(`message.ticket from`, {
            lang: ctx.message.from.language_code,
            args: {
                id: `#T${ticket.id.toString().padStart(6, '0')}`,
                username,
                lang: ctx.message.from.language_code,
                message: TicketService_1.escapeSpecialChars(originalMessage),
            },
        });
        await this.sendMessage(settings_1.default.staffChatId, message, ctx, true);
        if (category.groupId !== settings_1.default.staffChatId) {
            await this.sendMessage(category.groupId, message, ctx, true);
        }
    }
    async staffChat(ctx) {
        if (!ctx.session.admin) {
            return;
        }
        const ticket = await this.findTicketOrReplyNotFound(ctx);
        if (ticket == null) {
            return;
        }
        const message = TicketService_1.getMessageText(ctx);
        await this.createMessage(ticket.id, message, ctx.message.from);
        await this.sendMessage(ticket.userId, message, ctx);
        if (settings_1.default.autoCloseTickets) {
            await this.updateTicketStatus(ticket.id, ticket_status_1.TicketStatus.Closed);
        }
    }
    async findTicketOrReplyNotFound(ctx, status = ticket_status_1.TicketStatus.Open) {
        if (ctx.message == null || !('reply_to_message' in ctx.message) || ctx.message.reply_to_message == null || ctx.message.reply_to_message.from.id !== this.bot.botInfo.id) {
            return null;
        }
        const replyText = ('text' in ctx.message.reply_to_message ? ctx.message.reply_to_message.text : null)
            ?? ('caption' in ctx.message.reply_to_message ? ctx.message.reply_to_message.caption : '');
        const ticketId = replyText.match(TicketService_1.ticketMessageRegExp)?.[1];
        if (ticketId == null) {
            const message = await this.i18n.t(`message.Ticket id not found in message`, {
                lang: ctx.message.from.language_code,
            });
            await ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
            return null;
        }
        const ticket = await this.ticketRepository.findOne({
            id: Number(ticketId),
        });
        if (ticket == null) {
            const message = await this.i18n.t(`message.Ticket with id not found`, {
                lang: ctx.message.from.language_code,
                args: {
                    ticketId,
                },
            });
            await ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
            return null;
        }
        if (ticket.status !== status) {
            const message = await this.i18n.t(`message.Ticket is ticketStatus, not status`, {
                lang: ctx.message.from.language_code,
                args: {
                    ticketStatus: ticket.status,
                    status,
                },
            });
            await ctx.reply(message, { reply_to_message_id: ctx.message.message_id });
            return null;
        }
        return ticket;
    }
    updateTicketStatus(ticketId, status) {
        return this.ticketRepository.update({ id: ticketId }, { status });
    }
    createMessage(ticketId, message, from) {
        return this.messageRepository.save(this.messageRepository.create({
            ticketId,
            senderId: from.id.toString(),
            senderName: `${from.first_name} ${from.last_name ?? ''} ${from.username != null ? `(@${from.username})` : ''}`,
            message,
        }));
    }
    async sendMessage(chatId, message, ctx, forceSendTextMessage = false) {
        if ('text' in ctx.message || 'sticker' in ctx.message && forceSendTextMessage) {
            await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
        }
        if ('sticker' in ctx.message) {
            await this.bot.telegram.sendSticker(chatId, ctx.message.sticker.file_id);
        }
        else if ('photo' in ctx.message) {
            await this.bot.telegram.sendPhoto(chatId, ctx.message.photo[0].file_id, { caption: message, parse_mode: 'HTML' });
        }
        else if ('video' in ctx.message) {
            await this.bot.telegram.sendVideo(chatId, ctx.message.video.file_id, { caption: message, parse_mode: 'HTML' });
        }
        else if ('document' in ctx.message) {
            await this.bot.telegram.sendDocument(chatId, ctx.message.document.file_id, { caption: message, parse_mode: 'HTML' });
        }
    }
    async sendPublicLinks(ctx) {
        const links = this.categories
            .filter(cat => cat.isPublic)
            .map(cat => `<a href="https://t.me/${this.bot.botInfo.username}?start=${cat.id}">${cat.name}</a>`);
        if (links.length > 0) {
            const message = await this.i18n.t(`message.Public groups`, {
                lang: ctx.message.from.language_code,
                args: {
                    links: links.join('\n'),
                },
            });
            return ctx.reply(message, { parse_mode: 'HTML' });
        }
        return Promise.resolve();
    }
    async checkSpam(ticketId, senderId) {
        const messages = await this.messageRepository
            .createQueryBuilder('m')
            .select('sender_id')
            .where({
            ticketId,
            createdAt: (0, typeorm_2.Raw)(alias => `${alias} >= now()::date - interval ':1 minutes'`, [settings_1.default.spamTime]),
        })
            .orderBy({ created_at: 'DESC' })
            .getRawMany();
        let count = 0;
        for (const sender of messages) {
            if (sender.sender_id === senderId) {
                count++;
            }
            else {
                break;
            }
        }
        return count;
    }
};
TicketService.ticketMessageRegExp = /#T(\d+)/;
TicketService.escapeChars = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
};
TicketService.escapeCharsRegExp = new RegExp('[' + Object.keys(TicketService_1.escapeChars).join('') + ']', 'g');
TicketService = TicketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_telegraf_1.InjectBot)()),
    __param(1, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [telegraf_1.Telegraf,
        typeorm_2.Repository,
        typeorm_2.Repository,
        nestjs_i18n_1.I18nService])
], TicketService);
exports.TicketService = TicketService;
//# sourceMappingURL=ticket.service.js.map