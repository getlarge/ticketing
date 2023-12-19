import { jest } from '@jest/globals';

export class MockOryAuthenticationService {
  validateSession = jest.fn();
  updateIdentityMetadata = jest.fn();
  getIdentity = jest.fn();
  toggleIdentityState = jest.fn();
  deleteIdentity = jest.fn();
  signOut = jest.fn();
  createClient = jest.fn();
  getClient = jest.fn();
}
