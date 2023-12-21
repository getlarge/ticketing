import { jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import type { PermissionApi, RelationshipApi } from '@ory/client';

export class MockOryPermissionService {
  readonly logger = new Logger();
  private readonly relationShipApi: RelationshipApi;
  private readonly permissionApi: PermissionApi;

  createRelationQuery = jest.fn();
  createFlattenRelationQuery = jest.fn();
  createRelationTuple = jest.fn();
  createPermissionCheckQuery = jest.fn();
  createExpandPermissionQuery = jest.fn();

  createRelation = jest.fn();
  deleteRelation = jest.fn();
  getRelations = jest.fn();
  checkPermission = jest.fn();
  expandPermissions = jest.fn();
}
