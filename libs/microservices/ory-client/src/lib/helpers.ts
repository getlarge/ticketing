import type {
  PermissionApiCheckPermissionRequest,
  PermissionApiExpandPermissionsRequest,
  RelationQuery,
  Relationship,
} from '@ory/client';
import {
  isRelationTuple,
  isRelationTupleWithReplacements,
  RelationTuple,
  RelationTupleWithReplacements,
  ReplacementValues,
} from '@ticketing/microservices/shared/relation-tuple-parser';
import { get, omitBy } from 'lodash-es';

type RelationQueryFlat = Omit<RelationQuery, 'subject_set' | 'subject_id'> & {
  subjectSetNamespace?: string;
  subjectSetObject?: string;
  subjectSetRelation?: string;
  subjectId?: string;
};

type PermissionTuple = Pick<
  RelationTuple,
  'namespace' | 'object' | 'relation'
> &
  Partial<Pick<RelationTuple, 'subjectIdOrSet'>>;

type PermissionTupleWithReplacements<T extends ReplacementValues> = Pick<
  RelationTupleWithReplacements<T>,
  'namespace' | 'object' | 'relation'
> &
  Partial<Pick<RelationTupleWithReplacements<T>, 'subjectIdOrSet'>>;

const resolveTupleProperty = <
  T extends ReplacementValues,
  U extends Partial<RelationTuple | RelationTupleWithReplacements<T>>,
>(
  property: string,
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never,
): string | undefined => {
  const factory = get(tuple, property);
  if (typeof factory === 'function') {
    return factory(replacements ?? ({} as T));
  }
  if (typeof factory === 'string') {
    return factory;
  }
  return undefined;
};

export function createRelationQuery(
  tuple: Partial<RelationTuple>,
): RelationQuery;
export function createRelationQuery<T extends ReplacementValues>(
  tuple: Partial<RelationTupleWithReplacements<T>>,
  replacements: T,
): RelationQuery;
export function createRelationQuery<
  T extends ReplacementValues,
  U extends Partial<RelationTuple | RelationTupleWithReplacements<T>>,
>(
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never,
): RelationQuery {
  const { subjectIdOrSet } = tuple;
  const result: RelationQuery = {};

  result.namespace = resolveTupleProperty('namespace', tuple, replacements);
  result.object = resolveTupleProperty('object', tuple, replacements);
  result.relation = resolveTupleProperty('relation', tuple, replacements);

  if (typeof subjectIdOrSet === 'object' && subjectIdOrSet) {
    //          subjectId?: string;
    //      subjectSetNamespace?: string;
    //  subjectSetObject?: string;
    //  subjectSetRelation?: string;

    result.subject_set = {
      namespace:
        resolveTupleProperty('subjectIdOrSet.namespace', tuple, replacements) ??
        '',
      object:
        resolveTupleProperty('subjectIdOrSet.object', tuple, replacements) ??
        '',
      relation:
        resolveTupleProperty('subjectIdOrSet.relation', tuple, replacements) ??
        '',
    };
  } else {
    result.subject_id =
      resolveTupleProperty('subjectIdOrSet', tuple, replacements) ?? '';
  }

  return omitBy(result, (v) => !v);
}

export function createFlattenRelationQuery(
  tuple: Partial<RelationTuple>,
): RelationQueryFlat;
export function createFlattenRelationQuery<T extends ReplacementValues>(
  tuple: Partial<RelationTupleWithReplacements<T>>,
  replacements: T,
): RelationQueryFlat;
export function createFlattenRelationQuery<
  T extends ReplacementValues,
  U extends Partial<RelationTuple | RelationTupleWithReplacements<T>>,
>(
  tuple: U,
  replacements?: U extends RelationTupleWithReplacements<T> ? T : never,
): RelationQueryFlat {
  const { subjectIdOrSet } = tuple;
  const result: RelationQueryFlat = {};

  result.namespace = resolveTupleProperty('namespace', tuple, replacements);
  result.object = resolveTupleProperty('object', tuple, replacements);
  result.relation = resolveTupleProperty('relation', tuple, replacements);

  if (typeof subjectIdOrSet === 'object' && subjectIdOrSet) {
    result.subjectSetObject =
      resolveTupleProperty('subjectIdOrSet.object', tuple, replacements) ?? '';
    result.subjectSetNamespace =
      resolveTupleProperty('subjectIdOrSet.namespace', tuple, replacements) ??
      '';
    result.subjectSetRelation =
      resolveTupleProperty('subjectIdOrSet.relation', tuple, replacements) ??
      '';
  } else {
    result.subjectId =
      resolveTupleProperty('subjectIdOrSet', tuple, replacements) ?? '';
  }

  return omitBy(result, (v) => !v);
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
  tuple: PermissionTuple,
): PermissionApiCheckPermissionRequest;
export function createPermissionCheckQuery<T extends ReplacementValues>(
  tuple: PermissionTupleWithReplacements<T>,
  replacements: T,
): PermissionApiCheckPermissionRequest;
export function createPermissionCheckQuery<T extends ReplacementValues>(
  tuple: PermissionTuple | PermissionTupleWithReplacements<T>,
  replacements?: T,
): PermissionApiCheckPermissionRequest {
  if (isRelationTuple(tuple)) {
    tuple.subjectIdOrSet = tuple.subjectIdOrSet ?? '';
  } else if (isRelationTupleWithReplacements(tuple)) {
    tuple.subjectIdOrSet =
      tuple.subjectIdOrSet ??
      function () {
        return '';
      };
  } else {
    throw new TypeError('Invalid permission tuple');
  }

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
    delete relationship.subject_id;
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
    delete relationship.subject_set;
  }
  return result;
}

export function createExpandPermissionQuery<T extends ReplacementValues>(
  tuple: PermissionTuple | PermissionTupleWithReplacements<T>,
  replacements?: T,
): PermissionApiExpandPermissionsRequest {
  if (isRelationTuple(tuple)) {
    tuple.subjectIdOrSet = tuple.subjectIdOrSet ?? '';
  } else if (isRelationTupleWithReplacements(tuple)) {
    tuple.subjectIdOrSet =
      tuple.subjectIdOrSet ??
      function () {
        return '';
      };
  } else {
    throw new TypeError('Invalid permission tuple');
  }

  const relationship = createRelationTuple(tuple, replacements);

  return {
    namespace: relationship.namespace,
    object: relationship.object,
    relation: relationship.relation,
  };
}
