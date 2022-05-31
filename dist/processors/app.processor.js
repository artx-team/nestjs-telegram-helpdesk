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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const settings_1 = __importDefault(require("../settings"));
let AppProcessor = class AppProcessor {
    async fail(...args) {
        console.log('on q fail', args);
    }
};
__decorate([
    (0, bull_1.OnGlobalQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppProcessor.prototype, "fail", null);
AppProcessor = __decorate([
    (0, bull_1.Processor)(settings_1.default.bull?.appQueue)
], AppProcessor);
exports.AppProcessor = AppProcessor;
//# sourceMappingURL=app.processor.js.map