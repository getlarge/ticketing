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

const PERMISSION_CHECK_METADATA_KEY = Symbol('PermissionCheckKey');

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

export const getGuardingRelationTuple = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1],
): PermissionCheckMetadataType | null => {
  return (
    reflector.get<
      PermissionCheckMetadataType,
      typeof PERMISSION_CHECK_METADATA_KEY
    >(PERMISSION_CHECK_METADATA_KEY, handler) ?? null
  );
};
