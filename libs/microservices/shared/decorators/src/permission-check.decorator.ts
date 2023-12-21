import { CustomDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  parseRelationTuple,
  RelationTuple,
} from '@ticketing/microservices/shared/relation-tuple-parser';

type PermissionCheckMetadataType = {
  expression: (ctx: ExecutionContext) => string;
  relationTupleFactory?: (ctx: ExecutionContext) => RelationTuple;
};

const PERMISSION_CHECKS_METADATA_KEY = Symbol('PermissionChecksKey');
const PERMISSION_CHECK_METADATA_KEY = Symbol('PermissionCheckKey');

export const PermissionChecks = (
  ...relationTupleFactories: (string | ((ctx: ExecutionContext) => string))[]
): CustomDecorator<typeof PERMISSION_CHECKS_METADATA_KEY> => {
  const valueToSet: PermissionCheckMetadataType[] = [];

  for (const relationTupleFactory of relationTupleFactories) {
    if (typeof relationTupleFactory === 'string') {
      valueToSet.push({
        expression: () => relationTupleFactory,
        relationTupleFactory: () =>
          parseRelationTuple(relationTupleFactory).unwrapOrThrow(),
      });
    } else {
      valueToSet.push({
        expression: (ctx) => relationTupleFactory(ctx),
        relationTupleFactory: (ctx) =>
          parseRelationTuple(relationTupleFactory(ctx)).unwrapOrThrow(),
      });
    }
  }
  return SetMetadata(PERMISSION_CHECKS_METADATA_KEY, valueToSet);
};

export const PermissionCheck = (
  relationTupleFactory: string | ((ctx: ExecutionContext) => string),
): CustomDecorator<typeof PERMISSION_CHECK_METADATA_KEY> => {
  const valueToSet: PermissionCheckMetadataType = {
    relationTupleFactory: null,
    expression: null,
  };

  if (typeof relationTupleFactory === 'string') {
    valueToSet.expression = () => relationTupleFactory;
    valueToSet.relationTupleFactory = () =>
      parseRelationTuple(relationTupleFactory).unwrapOrThrow();
  } else {
    valueToSet.expression = (ctx) => relationTupleFactory(ctx);
    valueToSet.relationTupleFactory = (ctx) =>
      parseRelationTuple(relationTupleFactory(ctx)).unwrapOrThrow();
  }

  return SetMetadata(PERMISSION_CHECK_METADATA_KEY, valueToSet);
};

export const getGuardingRelationTuples = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1],
): PermissionCheckMetadataType[] | null => {
  const permissionChecks: PermissionCheckMetadataType[] = [];
  const permissionChecksMetadata =
    reflector.get<
      PermissionCheckMetadataType[],
      typeof PERMISSION_CHECKS_METADATA_KEY
    >(PERMISSION_CHECKS_METADATA_KEY, handler) ?? [];
  permissionChecks.push(...permissionChecksMetadata);

  const permissionCheckMetadata =
    reflector.get<
      PermissionCheckMetadataType,
      typeof PERMISSION_CHECK_METADATA_KEY
    >(PERMISSION_CHECK_METADATA_KEY, handler) ?? null;

  if (permissionCheckMetadata) {
    permissionChecks.push(permissionCheckMetadata);
  }
  return permissionChecks.length > 0 ? permissionChecks : null;
};
