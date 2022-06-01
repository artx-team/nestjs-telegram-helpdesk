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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveOldTicketsProcessor = exports.REMOVE_OLD_TICKETS_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const ticket_service_1 = require("../ticket/ticket.service");
exports.REMOVE_OLD_TICKETS_QUEUE = 'nestjs-telegram-helpdesk-remove-old-tickets';
let RemoveOldTicketsProcessor = class RemoveOldTicketsProcessor {
    constructor(ticketService) {
        this.ticketService = ticketService;
    }
    async removeOldTickets() {
        await this.ticketService.removeOldTickets();
        console.log('Old log entries removed');
    }
};
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RemoveOldTicketsProcessor.prototype, "removeOldTickets", null);
RemoveOldTicketsProcessor = __decorate([
    (0, bull_1.Processor)(exports.REMOVE_OLD_TICKETS_QUEUE),
    __metadata("design:paramtypes", [ticket_service_1.TicketService])
], RemoveOldTicketsProcessor);
exports.RemoveOldTicketsProcessor = RemoveOldTicketsProcessor;
//# sourceMappingURL=remove-old-tickets.processor.js.map