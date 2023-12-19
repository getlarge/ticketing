import type {
  PermissionApiCheckPermissionRequest,
  RelationQuery,
  Relationship,
} from '@ory/client';
import {
  isRelationTuple,
  RelationTuple,
  RelationTupleWithReplacements,
  ReplacementValues,
} from '@ticketing/microservices/shared/relation-tuple-parser';

export function createRelationQuery(tuple: RelationTuple): RelationQuery;
export function createRelationQuery<T extends ReplacementValues>(
  tuple: RelationTupleWithReplacements<T>,
  replacements: T,
): RelationQuery;
export function createRelationQuery<
  T extends ReplacementValues,
  U extends RelationTuple | RelationTupleWithReplacements<T>,
>(
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never,
): RelationQuery {
  return createRelationTuple(tuple, replacements);
}

export function createRelationTuple(tuple: RelationTuple): Relationship;
export function createRelationTuple<T extends ReplacementValues>(
  tuple: RelationTupleWithReplacements<T>,
  replacements: T,
): Relationship;
export function createRelationTuple<T extends ReplacementValues>(
  tuple: RelationTuple | RelationTupleWithReplacements<T>,
  opt_replacements?: T,
): Relationship;
export function createRelationTuple<
  T extends ReplacementValues,
  U extends RelationTuple | RelationTupleWithReplacements<T>,
>(
  tuple: U,
  opt_replacements?: U extends RelationTupleWithReplacements<T> ? T : never,
): Relationship {
  if (isRelationTuple(tuple)) {
    const result: Relationship = {
      namespace: tuple.namespace,
      object: tuple.object,
      relation: tuple.relation,
    };

    if (typeof tuple.subjectIdOrSet === 'string') {
      result.subject_id = tuple.subjectIdOrSet;
    } else {
      result.subject_set = {
        ...tuple.subjectIdOrSet,
        relation: tuple.subjectIdOrSet.relation ?? '',
      };
    }

    return result;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const replacements: T = opt_replacements!; // cannot be null

  const result: Relationship = {
    namespace: tuple.namespace(replacements),
    object: tuple.object(replacements),
    relation: tuple.relation(replacements),
  };

  if (typeof tuple.subjectIdOrSet === 'function') {
    result.subject_id = tuple.subjectIdOrSet(replacements);
  } else {
    result.subject_set = {
      namespace: tuple.subjectIdOrSet.namespace(replacements),
      object: tuple.subjectIdOrSet.object(replacements),
      relation: tuple.subjectIdOrSet.relation(replacements) ?? '',
    };
  }

  return result;
}

export function createPermissionCheckQuery(
  tuple: RelationTuple,
): PermissionApiCheckPermissionRequest;
export function createPermissionCheckQuery<T extends ReplacementValues>(
  tuple: RelationTupleWithReplacements<T>,
  replacements: T,
): PermissionApiCheckPermissionRequest;
export function createPermissionCheckQuery<T extends ReplacementValues>(
  tuple: RelationTuple | RelationTupleWithReplacements<T>,
  replacements?: T,
): PermissionApiCheckPermissionRequest {
  const relationship = createRelationTuple(tuple, replacements);

  const result: PermissionApiCheckPermissionRequest = {
    namespace: relationship.namespace,
    object: relationship.object,
    relation: relationship.relation,
  };

  if (relationship.subject_id) {
    Object.defineProperty(result, 'subjectId', {
      value: relationship.subject_id,
      enumerable: true,
    });
  } else if (relationship.subject_set) {
    Object.defineProperties(result, {
      subjectSetNamespace: {
        value: relationship.subject_set.namespace,
        enumerable: true,
      },
      subjectSetObject: {
        value: relationship.subject_set.object,
        enumerable: true,
      },
      subjectSetRelation: {
        value: relationship.subject_set.relation,
        enumerable: true,
      },
    });
  }
  return result;
}
