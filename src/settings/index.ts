//import chalk from 'chalk';
import {plainToInstance} from 'class-transformer';
import {validateSync} from 'class-validator';
import {load} from 'js-yaml';

import fs from 'fs';

import {Settings} from './entities/settings';

const SETTINGS_PARSING_ERROR = '\n\nSETTINGS PARSING ERROR';

function parseYml(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return load(content);
  } catch (e) {
    console.error((`${SETTINGS_PARSING_ERROR} ${filePath}`));
    console.error((e));
    process.exit(1);
  }
}

function validateSettings(settings: Settings): Settings {
  const errors = validateSync(settings);

  if (errors.length) {
    console.error((SETTINGS_PARSING_ERROR));
    console.error((errors.join('\n')));
    process.exit(1);
  }

  return settings;
}

function getSettings(settingsFilePath = './settings.yml'): Settings {
  let settings = parseYml(settingsFilePath);

  if (!settings) {
    console.error((`${SETTINGS_PARSING_ERROR} empty file content`));
    process.exit(1);
  }

  settings = validateSettings(plainToInstance(Settings, settings));

  return settings;
}

const settings = getSettings();

export default settings;
