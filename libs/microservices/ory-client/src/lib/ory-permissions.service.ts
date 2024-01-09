import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
import { OryError } from './ory.error';
import { OryPermissionsModuleOptions } from './ory.interfaces';

@Injectable()
export class OryPermissionsService implements OnModuleInit {
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

  onModuleInit(): void {
    this.relationShipApi['axios'].defaults.validateStatus = (
      status: number,
    ) => {
      return status >= 200 && status < 300;
    };
    this.relationShipApi['axios'].interceptors.response.use(
      (response) => response,
      (error) => {
        // TODO: retry on 429
        const oryError = new OryError(error);
        return Promise.reject(oryError);
      },
    );

    this.permissionApi['axios'].defaults.validateStatus = (status: number) => {
      return status >= 200 && status < 300;
    };
    this.permissionApi['axios'].interceptors.response.use(
      (response) => response,
      (error) => {
        const oryError = new OryError(error);
        return Promise.reject(oryError);
      },
    );
  }

  createRelationQuery = createRelationQuery;

  createFlattenRelationQuery = createFlattenRelationQuery;

  createRelationTuple = createRelationTuple;

  createPermissionCheckQuery = createPermissionCheckQuery;

  createExpandPermissionQuery = createExpandPermissionQuery;

  async createRelation(tuple: Partial<RelationTuple>): Promise<boolean> {
    const createRelationshipBody = this.createRelationQuery(tuple);
    await this.relationShipApi.createRelationship({
      createRelationshipBody,
    });
    return true;
  }
  // TODO: write a batch create method with rollback on error
  // async createRelations(tuples: RelationTuple[]): Promise<boolean> {
  // }

  async deleteRelation(tuple: Partial<RelationTuple>): Promise<boolean> {
    const relationQuery = this.createRelationQuery(tuple);
    //! the type of RelationshipApiDeleteRelationshipsRequest is wrong in @ory/client
    await this.relationShipApi.deleteRelationships(relationQuery);
    return true;
  }

  async getRelations(
    tuple: Partial<RelationTuple>,
    pagination: { pageSize?: number; pageToken?: string } = {},
  ): Promise<Relationships> {
    const relationQuery = this.createFlattenRelationQuery(tuple);
    const { data } = await this.relationShipApi.getRelationships({
      ...relationQuery,
      ...pagination,
    });
    return data;
  }

  async checkPermission(relationTuple: RelationTuple): Promise<boolean> {
    const checkRequest = this.createPermissionCheckQuery(relationTuple);
    const { data } = await this.permissionApi.checkPermission(checkRequest);
    return data.allowed;
  }

  async expandPermissions(
    relationTuple: Pick<RelationTuple, 'namespace' | 'object' | 'relation'>,
    maxDepth = 3,
  ): Promise<ExpandedPermissionTree> {
    const checkRequest = this.createExpandPermissionQuery(relationTuple);
    const { data } = await this.permissionApi.expandPermissions({
      ...checkRequest,
      maxDepth,
    });
    return data;
  }
}
