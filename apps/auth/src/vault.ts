import { config } from 'dotenv';
import { join } from 'node:path';

import { APP_FOLDER } from './app/shared/constants';

export default config({ path: join(APP_FOLDER, '.env') });
