import { Inject, Injectable, Logger } from '@nestjs/common';
import { Configuration, PermissionApi, RelationshipApi } from '@ory/client';
import { PermissionObjects } from '@ticketing/microservices/shared/models';
import {
  type RelationTuple,
  type RelationTupleWithReplacements,
} from '@ticketing/microservices/shared/relation-tuple-parser';

import {
  createPermissionCheckQuery,
  createRelationQuery,
  createRelationTuple,
} from './helpers';
import { OryModuleOptions } from './ory.interfaces';

@Injectable()
export class OryPermissionsService {
  readonly logger = new Logger(OryPermissionsService.name);
  private readonly relationShipApi: RelationshipApi;
  private readonly permissionApi: PermissionApi;

  constructor(@Inject(OryModuleOptions) options: OryModuleOptions) {
    this.relationShipApi = new RelationshipApi(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
    );
    this.permissionApi = new PermissionApi(
      new Configuration({
        basePath: options.basePath,
        accessToken: options.accessToken,
      }),
    );
  }

  createRelationQuery = createRelationQuery;

  createRelationTuple = createRelationTuple;

  createPermissionCheckQuery = createPermissionCheckQuery;

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

  async checkPermission(
    relationTuple: RelationTupleWithReplacements<PermissionObjects>,
    replacements: PermissionObjects,
  ): Promise<boolean> {
    const checkRequest = this.createPermissionCheckQuery(
      relationTuple,
      replacements,
    );
    try {
      const { data } = await this.permissionApi.checkPermission(checkRequest);
      return data.allowed;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
