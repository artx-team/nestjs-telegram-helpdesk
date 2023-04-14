import {Settings} from './entities/settings';

import {getSettings} from '@/settings/util/get-settings';

const settings = getSettings('./settings.yml', Settings);

export default settings;
