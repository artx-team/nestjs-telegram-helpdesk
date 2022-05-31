"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const js_yaml_1 = require("js-yaml");
const fs_1 = __importDefault(require("fs"));
const settings_1 = require("./entities/settings");
const SETTINGS_PARSING_ERROR = '\n\nSETTINGS PARSING ERROR';
function parseYml(filePath) {
    try {
        const content = fs_1.default.readFileSync(filePath, 'utf-8');
        return (0, js_yaml_1.load)(content);
    }
    catch (e) {
        console.error(chalk_1.default.red(`${SETTINGS_PARSING_ERROR} ${filePath}`));
        console.error(chalk_1.default.red(e));
        process.exit(1);
    }
}
function validateSettings(settings) {
    const errors = (0, class_validator_1.validateSync)(settings);
    if (errors.length) {
        console.error(chalk_1.default.red(SETTINGS_PARSING_ERROR));
        console.error(chalk_1.default.red(errors.join('\n')));
        process.exit(1);
    }
    return settings;
}
function getSettings(settingsFilePath = './settings.yml') {
    let settings = parseYml(settingsFilePath);
    if (!settings) {
        console.error(chalk_1.default.red(`${SETTINGS_PARSING_ERROR} empty file content`));
        process.exit(1);
    }
    settings = validateSettings((0, class_transformer_1.plainToInstance)(settings_1.Settings, settings));
    return settings;
}
const settings = getSettings();
exports.default = settings;
//# sourceMappingURL=index.js.map