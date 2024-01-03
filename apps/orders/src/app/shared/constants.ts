import { join } from "node:path";

export const APP_FOLDER = join('apps', 'payments');
export const DEFAULT_PORT = 3020;
export const DEFAULT_SERVER_URL = `http://localhost:${DEFAULT_PORT}`;

export const EXPIRATION_CLIENT = 'EXPIRATION_CLIENT';
export const TICKETS_CLIENT = 'TICKETS_CLIENT';
export const PAYMENTS_CLIENT = 'PAYMENTS_CLIENT';
