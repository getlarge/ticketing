import { Inject, Injectable, Logger } from '@nestjs/common';
import { Configuration, PermissionApi, RelationshipApi } from '@ory/client';
import { PermissionObjects } from '@ticketing/microservices/shared/models';
import type {
  RelationTuple,
  RelationTupleWithReplacements,
} from '@ticketing/microservices/shared/relation-tuple-parser';

import { createRelationQuery, createRelationTuple } from './helpers';
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

  async createRelation(tuple: RelationTuple): Promise<boolean> {
    const query = createRelationQuery(tuple);
    try {
      await this.relationShipApi.createRelationship({
        createRelationshipBody: query,
      });
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
    const checkRequest = createRelationTuple(relationTuple, replacements);
    const { data } = await this.permissionApi.checkPermission(checkRequest);
    return data.allowed;
  }
}
