import {Inject} from '@nestjs/common';
import {I18nTranslation, I18nYamlLoader, I18N_LOADER_OPTIONS} from 'nestjs-i18n';
import {exists, getDirectories, getFiles} from 'nestjs-i18n/dist/utils/file';

import {readFile} from 'fs/promises';
import {basename, dirname, join, normalize, relative, sep} from 'path';

import {I18nMultiYamlLoaderOptions} from '@/i18n/i18n-multi-yaml.loader.options';

export class I18nMultiYamlLoader extends I18nYamlLoader {

  constructor(
    @Inject(I18N_LOADER_OPTIONS) private opts: I18nMultiYamlLoaderOptions,
  ) {
    super(opts);
    this.opts = this.sanitizeOptions(opts);
  }

  protected async parseTranslations(): Promise<I18nTranslation> {
    const translations: I18nTranslation = {};

    for (let i = 0; i < this.opts.paths.length; i++) {
      const i18nPath = normalize(this.opts.paths[i] + sep);

      if (!(await exists(i18nPath))) {
        throw new Error(`i18n path (${i18nPath}) cannot be found`);
      }

      if (!this.opts.filePattern.match(/\*\.[A-z]+/)) {
        throw new Error(
          `filePattern should be formatted like: *.json, *.txt, *.custom etc`,
        );
      }

      const languages = await this.parseLanguages();

      const pattern = new RegExp(
        '.' + this.opts.filePattern.replace('.', '.'),
      );

      const files = await [
        ...languages.map(l => join(i18nPath, l)),
        i18nPath,
      ].reduce(async (f: Promise<string[]>, p: string) => {
        (await f).push(
          ...(await getFiles(p, pattern, this.opts.includeSubfolders)),
        );
        return f;
      }, Promise.resolve([]));

      for (const file of files) {
        let global = false;

        const pathParts = dirname(relative(i18nPath, file))
          .split(sep);
        const key = pathParts[0];

        if (key === '.') {
          global = true;
        }

        const data = this.formatData(await readFile(file, 'utf8'));

        const prefix = [...pathParts.slice(1), basename(file).split('.')[0]];

        for (const property of Object.keys(data)) {
          [...(global ? languages : [key])].forEach(lang => {
            translations[lang] = translations[lang] ? translations[lang] : {};

            if (global) {
              translations[lang][property] = data[property];
            } else {
              this.assignPrefixedTranslation(
                translations[lang],
                prefix,
                property,
                data[property],
              );
            }
          });
        }
      }
    }

    return translations;
  }

  protected sanitizeOptions(options: I18nMultiYamlLoaderOptions): I18nMultiYamlLoaderOptions {
    options = super.sanitizeOptions(options) as I18nMultiYamlLoaderOptions;

    options.paths = options.paths.map(path => normalize(path + sep));

    return options;
  }

  protected async parseLanguages(): Promise<string[]> {
    const langs = [];

    for (let i = 0; i < this.opts.paths.length; i++) {
      const i18nPath = normalize(this.opts.paths + sep);
      const got = (await getDirectories(i18nPath)).map(dir => relative(i18nPath, dir));
      got.forEach(lang => {
        if (!langs.includes(lang)) {
          langs.push(lang);
        }
      });
    }

    return langs;
  }

}
