import {normalize, sep} from 'path';

import settings from '@/settings';

export const plugins = [];

export async function loadPlugins(): Promise<void> {
  if (settings.plugins.length > 0) {
    const loaded = await Promise.all(settings.plugins.map(m => import(normalize(process.cwd() + sep + m))));

    loaded.forEach(m => plugins.push(m.default));
  }
}
