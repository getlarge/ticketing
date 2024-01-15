import { jest } from '@jest/globals';

export class MockOryPermissionsService {
  checkPermission = jest.fn();
  expandPermissions = jest.fn();
}
