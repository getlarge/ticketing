import { join } from 'node:path';

export const APP_FOLDER = join('apps', 'tickets');
export const DEFAULT_PORT = 3010;
export const DEFAULT_SERVER_URL = `http://localhost:${DEFAULT_PORT}`;

export const TICKETS_CLIENT = 'TICKETS_CLIENT';
export const ORDERS_CLIENT = 'ORDERS_CLIENT';

export const ORY_AUTH_GUARD = 'ORY_AUTH_GUARD';
export const ORY_OAUTH2_GUARD = 'ORY_OAUTH2_GUARD';
