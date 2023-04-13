import {DataSource} from 'typeorm';

import config from '@/orm.config';

export default new DataSource(config);
