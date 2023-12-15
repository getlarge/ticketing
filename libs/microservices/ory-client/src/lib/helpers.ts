import type { RelationQuery, Relationship } from '@ory/client';
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
export function createRelationQuery<T extends ReplacementValues>(
  tuple: RelationTuple | RelationTupleWithReplacements<T>,
  replacements?: T,
): RelationQuery {
  if (isRelationTuple(tuple)) {
    return createRelationTuple(tuple);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return createRelationTuple(tuple, replacements!);
}

export function createRelationTuple(tuple: RelationTuple): Relationship;
export function createRelationTuple<T extends ReplacementValues>(
  tuple: RelationTupleWithReplacements<T>,
  replacements: T,
): Relationship;
export function createRelationTuple<T extends ReplacementValues>(
  tuple: RelationTuple | RelationTupleWithReplacements<T>,
  opt_replacements?: T,
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
