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
exports.Settings = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const db_1 = require("./db");
const redis_1 = require("./redis");
const bull_settings_1 = require("./bull-settings");
const support_category_1 = require("../../dto/support-category");
class Settings {
}
__decorate([
    (0, class_transformer_1.Type)(() => db_1.Db),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", db_1.Db)
], Settings.prototype, "db", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => redis_1.Redis),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", redis_1.Redis)
], Settings.prototype, "redis", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => bull_settings_1.BullSettings),
    (0, class_validator_1.ValidateNested)(),
    (0, class_validator_1.ValidateIf)(o => !!o.redis),
    __metadata("design:type", bull_settings_1.BullSettings)
], Settings.prototype, "bull", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Settings.prototype, "botToken", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Settings.prototype, "staffChatId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Settings.prototype, "ownerId", void 0);
__decorate([
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], Settings.prototype, "spamTime", void 0);
__decorate([
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], Settings.prototype, "spamCantMsg", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Settings.prototype, "allowPrivate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Settings.prototype, "directReply", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Settings.prototype, "autoCloseTickets", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], Settings.prototype, "anonymousTickets", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => support_category_1.SupportCategory),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], Settings.prototype, "categories", void 0);
exports.Settings = Settings;
//# sourceMappingURL=settings.js.map