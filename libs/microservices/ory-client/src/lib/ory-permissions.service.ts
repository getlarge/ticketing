import { Inject, Injectable, Logger } from '@nestjs/common';
import { Configuration, PermissionApi, RelationshipApi } from '@ory/client';
import { type RelationTuple } from '@ticketing/microservices/shared/relation-tuple-parser';

import {
  createPermissionCheckQuery,
  createRelationQuery,
  createRelationTuple,
} from './helpers';
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

  createRelationTuple = createRelationTuple;

  createPermissionCheckQuery = createPermissionCheckQuery;

  // TODO: cache on write ?
  async createRelation(tuple: RelationTuple): Promise<boolean> {
    try {
      const createRelationshipBody = this.createRelationQuery(tuple);
      await this.relationShipApi.createRelationship({
        createRelationshipBody,
      });
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  // async createRelations(tuples: RelationTuple[]): Promise<boolean> {
  //   let createdRelations: RelationTuple[] = [];
  //   for (const tuple of tuples) {
  //     const created = await this.createRelation(tuple);
  //     if (!created) {
  //       await this.deleteRelations(createdRelations);
  //       return false;
  //     }
  //   }
  // }

  async deleteRelation(tuple: RelationTuple): Promise<boolean> {
    try {
      const relationQuery = this.createRelationQuery(tuple);
      await this.relationShipApi.deleteRelationships(relationQuery);
      return true;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  // TODO: add caching ?
  async checkPermission(relationTuple: RelationTuple): Promise<boolean> {
    const checkRequest = this.createPermissionCheckQuery(relationTuple);
    try {
      const { data } = await this.permissionApi.checkPermission(checkRequest);
      return data.allowed;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
