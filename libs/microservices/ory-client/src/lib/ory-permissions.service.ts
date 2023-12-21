import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Configuration,
  ExpandedPermissionTree,
  PermissionApi,
  RelationshipApi,
  Relationships,
} from '@ory/client';
import { type RelationTuple } from '@ticketing/microservices/shared/relation-tuple-parser';

import {
  createExpandPermissionQuery,
  createFlattenRelationQuery,
  createPermissionCheckQuery,
  createRelationQuery,
  createRelationTuple,
} from './helpers';
import { OryPermissionError } from './ory.error';
import { OryPermissionsModuleOptions } from './ory.interfaces';

@Injectable()
export class OryPermissionsService {
  readonly logger = new Logger(OryPermissionsService.name);
  private readonly relationShipApi: RelationshipApi;
  private readonly permissionApi: PermissionApi;

  constructor(
    @Inject(OryPermissionsModuleOptions) options: OryPermissionsModuleOptions,
  ) {
    const { ketoAccessToken, ketoAdminApiPath, ketoPublicApiPath } = options;
    this.relationShipApi = new RelationshipApi(
      new Configuration({
        basePath: ketoAdminApiPath,
        accessToken: ketoAccessToken,
      }),
    );
    this.permissionApi = new PermissionApi(
      new Configuration({
        basePath: ketoPublicApiPath,
        accessToken: ketoAccessToken,
      }),
    );
  }

  createRelationQuery = createRelationQuery;

  createFlattenRelationQuery = createFlattenRelationQuery;

  createRelationTuple = createRelationTuple;

  createPermissionCheckQuery = createPermissionCheckQuery;

  createExpandPermissionQuery = createExpandPermissionQuery;

  async createRelation(tuple: Partial<RelationTuple>): Promise<boolean> {
    try {
      const createRelationshipBody = this.createRelationQuery(tuple);
      await this.relationShipApi.createRelationship({
        createRelationshipBody,
      });
      return true;
    } catch (e) {
      const error = new OryPermissionError(e, tuple);
      this.logger.error(error);
      return false;
    }
  }
  // TODO: write a batch create method with rollback on error
  // async createRelations(tuples: RelationTuple[]): Promise<boolean> {
  // }

  async deleteRelation(tuple: Partial<RelationTuple>): Promise<boolean> {
    try {
      const relationQuery = this.createFlattenRelationQuery(tuple);
      await this.relationShipApi.deleteRelationships(relationQuery);
      return true;
    } catch (e) {
      const error = new OryPermissionError(e, tuple);
      this.logger.error(error);
      return false;
    }
  }

  async getRelations(
    tuple: Partial<RelationTuple>,
    pagination: { pageSize?: number; pageToken?: string } = {},
  ): Promise<Relationships> {
    try {
      const relationQuery = this.createFlattenRelationQuery(tuple);
      const { data } = await this.relationShipApi.getRelationships({
        ...relationQuery,
        ...pagination,
      });
      return data;
    } catch (e) {
      const error = new OryPermissionError(e, tuple);
      this.logger.error(error);
      return {
        relation_tuples: [],
        next_page_token: '',
      };
    }
  }

  async checkPermission(relationTuple: RelationTuple): Promise<boolean> {
    const checkRequest = this.createPermissionCheckQuery(relationTuple);
    try {
      const { data } = await this.permissionApi.checkPermission(checkRequest);
      return data.allowed;
    } catch (e) {
      const error = new OryPermissionError(e, relationTuple);
      this.logger.error(error);
      return false;
    }
  }

  async expandPermissions(
    relationTuple: Pick<RelationTuple, 'namespace' | 'object' | 'relation'>,
    maxDepth = 3,
  ): Promise<ExpandedPermissionTree> {
    const checkRequest = this.createExpandPermissionQuery(relationTuple);
    try {
      const { data } = await this.permissionApi.expandPermissions({
        ...checkRequest,
        maxDepth,
      });
      return data;
    } catch (e) {
      const error = new OryPermissionError(e, relationTuple);
      this.logger.error(error);
      return {
        type: 'unspecified',
      };
    }
  }
}
