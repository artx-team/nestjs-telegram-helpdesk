import {load} from 'js-yaml';

import fs from 'fs';

import {SETTINGS_PARSING_ERROR} from '@/settings/util/settings-parsing-error';

export function parseYml(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return load(content);
  } catch (e) {
    console.error((`${SETTINGS_PARSING_ERROR} ${filePath}`));
    console.error((e));
    process.exit(1);
  }
}
