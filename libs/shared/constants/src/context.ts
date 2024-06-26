export enum Services {
  AUTH_SERVICE = 'AUTH_SERVICE',
  EXPIRATION_SERVICE = 'EXPIRATION_SERVICE',
  ORDERS_SERVICE = 'ORDERS_SERVICE',
  PAYMENTS_SERVICE = 'PAYMENTS_SERVICE',
  TICKETS_SERVICE = 'TICKETS_SERVICE',
}

export enum Resources {
  EXPIRATION = 'expiration',
  HEALTH = 'health',
  GROUPS = 'groups',
  ORDERS = 'orders',
  PAYMENTS = 'payments',
  TICKETS = 'tickets',
  USERS = 'users',
  CLIENTS = 'clients',
}

export enum Actions {
  CONFIRM = 'confirm',
  CONFIRMED = 'confirmed',
  CREATE_MANY = 'create_many',
  CREATE_ONE = 'create_one',
  CREATED_MANY = 'created_many',
  CREATED_ONE = 'created_one',
  DELETE_ALL = 'delete_all',
  DELETE_MANY = 'delete_many',
  DELETE_ONE = 'delete_one',
  DELETED_MANY = 'deleted_many',
  DELETED_ONE = 'deleted_one',
  READ_MANY = 'read_many',
  READ_ONE = 'read_one',
  REPLACE_MANY = 'replace_many',
  REPLACE_ONE = 'replace_one',
  REPLACED_MANY = 'replaced_many',
  REPLACED_ONE = 'replaced_one',
  REVOKE = 'revoke',
  REVOKED = 'revoked',
  RESET = 'reset',
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  SIGN_UP = 'sign_up',
  UPDATE_MANY = 'update_many',
  UPDATE_ONE = 'update_one',
  UPDATED_MANY = 'updated_many',
  UPDATED_ONE = 'updated_one',
  VALIDATE_MANY = 'validate_many',
  VALIDATE_ONE = 'validate_one',
  ALL = '*',
}

export const CURRENT_USER_KEY = 'user';
export const CURRENT_CLIENT_KEY = 'client';
export const SESSION_ACCESS_TOKEN = 'access_token';
