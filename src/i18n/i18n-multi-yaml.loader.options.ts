import {I18nAbstractLoaderOptions} from 'nestjs-i18n/dist/loaders/i18n.abstract.loader';

export interface I18nMultiYamlLoaderOptions extends I18nAbstractLoaderOptions {
  paths: string[];
}
