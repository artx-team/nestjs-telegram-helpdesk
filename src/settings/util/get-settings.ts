import {plainToInstance} from 'class-transformer';
import {validateSettings} from './validate-settings';
import {SETTINGS_PARSING_ERROR} from './settings-parsing-error';
import {parseYml} from './parse-yml';
import {Type} from '@nestjs/common';

export function getSettings<T extends object>(settingsFilePath: string, type: Type<T>): T {
  let settings = parseYml(settingsFilePath);

  if (!settings) {
    console.error((`${SETTINGS_PARSING_ERROR} empty file content`));
    process.exit(1);
  }

  settings = validateSettings(plainToInstance(type, settings));

  return settings;
}
