import {validateSync} from 'class-validator';
import {SETTINGS_PARSING_ERROR} from './settings-parsing-error';

export function validateSettings<T extends object>(settings: T): T {
  const errors = validateSync(settings);

  if (errors.length) {
    console.error((SETTINGS_PARSING_ERROR));
    console.error((errors.join('\n')));
    process.exit(1);
  }

  return settings;
}
