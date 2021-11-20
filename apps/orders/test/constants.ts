import { resolve } from 'path';

import { APP_FOLDER } from '../src/app/shared/constants';

export const envFilePath = resolve(`${APP_FOLDER}/.env.test`);
