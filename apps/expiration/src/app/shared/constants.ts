import { join } from "node:path";

export const APP_FOLDER = join('apps', 'expiration');
export const DEFAULT_PORT = 3030;
export const DEFAULT_SERVER_URL = `http://localhost:${DEFAULT_PORT}`;
export const ORDERS_QUEUE = 'orders-queue';
export const ORDERS_EXPIRATION_JOB = 'order:expiration';

export const ORDERS_CLIENT = 'ORDERS_CLIENT';
