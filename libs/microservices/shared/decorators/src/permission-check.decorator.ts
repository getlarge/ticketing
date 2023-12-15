import { CustomDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionObjects } from '@ticketing/microservices/shared/models';
import {
  parseRelationTupleWithReplacements,
  RelationTupleStringGenerator,
  RelationTupleWithReplacements,
} from '@ticketing/microservices/shared/relation-tuple-parser';

type ReplacementPaths<
  P extends PermissionObjects = PermissionObjects,
  K extends keyof P = keyof P,
> = Record<K, string> | ((ctx: ExecutionContext) => Record<K, string>);

type PermissionCheckMetadataType<
  P extends PermissionObjects = PermissionObjects,
> = {
  expression: (ctx: ExecutionContext) => string;
  relationTuple: RelationTupleWithReplacements<P>;
  replacementsFactory?: (ctx: ExecutionContext) => Record<keyof P, string>;
};

const PERMISSION_CHECK_METADATA_KEY = Symbol('PermissionCheckKey');

export const PermissionCheck = (
  relationTuple: string | RelationTupleStringGenerator<PermissionObjects>,
  replacementsFactory?: ReplacementPaths<PermissionObjects>,
): CustomDecorator<typeof PERMISSION_CHECK_METADATA_KEY> => {
  const valueToSet: PermissionCheckMetadataType = {
    relationTuple: null,
    replacementsFactory: null,
    expression: null,
  };

  if (typeof replacementsFactory === 'function') {
    valueToSet.replacementsFactory = replacementsFactory;
  } else {
    valueToSet.replacementsFactory = replacementsFactory
      ? () => replacementsFactory
      : undefined;
  }

  if (typeof relationTuple === 'string') {
    valueToSet.expression = () => relationTuple;
    valueToSet.relationTuple = parseRelationTupleWithReplacements(
      () => relationTuple,
    ).unwrapOrThrow();
  } else {
    valueToSet.expression = (ctx) =>
      relationTuple(valueToSet?.replacementsFactory(ctx));
    valueToSet.relationTuple =
      parseRelationTupleWithReplacements(relationTuple).unwrapOrThrow();
  }

  return SetMetadata(PERMISSION_CHECK_METADATA_KEY, valueToSet);
};

export const getGuardingRelationTuple = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1],
): PermissionCheckMetadataType<PermissionObjects> | null => {
  return (
    reflector.get<
      PermissionCheckMetadataType,
      typeof PERMISSION_CHECK_METADATA_KEY
    >(PERMISSION_CHECK_METADATA_KEY, handler) ?? null
  );
};
