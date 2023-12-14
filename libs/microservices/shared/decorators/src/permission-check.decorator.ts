import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  parseRelationTupleWithReplacements,
  RelationTupleStringGenerator,
  RelationTupleWithReplacements,
} from '@nidomiro/relation-tuple-parser';
import { PermissionObjects } from '@ticketing/microservices/shared/models';

type PermissionCheckMetadataType =
  RelationTupleWithReplacements<PermissionObjects>;

const PERMISSION_CHECK_METADATA_KEY = Symbol('PermissionCheckKey');

// TODO: add path (in the request) to the tuple dynamic parameters
export const PermissionCheck = (
  relationTuple: string | RelationTupleStringGenerator<PermissionObjects>,
): CustomDecorator<typeof PERMISSION_CHECK_METADATA_KEY> => {
  let valueToSet: PermissionCheckMetadataType;
  if (typeof relationTuple === 'string') {
    valueToSet = parseRelationTupleWithReplacements(
      () => relationTuple,
    ).unwrapOrThrow();
  } else {
    valueToSet =
      parseRelationTupleWithReplacements(relationTuple).unwrapOrThrow();
  }

  return SetMetadata(PERMISSION_CHECK_METADATA_KEY, valueToSet);
};

export const getGuardingRelationTuple = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1],
): RelationTupleWithReplacements<PermissionObjects> | null => {
  return (
    reflector.get<
      PermissionCheckMetadataType,
      typeof PERMISSION_CHECK_METADATA_KEY
    >(PERMISSION_CHECK_METADATA_KEY, handler) ?? null
  );
};
