import { RelationTuple } from '../relation-tuple.js';
import { ReplacementValues } from './replacement-values.js';

export type ReplaceableString<
  T extends ReplacementValues,
  R extends string | undefined = string,
> = (replacements: T) => R;

export interface SubjectSetWithReplacements<T extends ReplacementValues> {
  namespace: ReplaceableString<T>;
  object: ReplaceableString<T>;
  relation: ReplaceableString<T, string | undefined>;
}

export interface RelationTupleWithReplacements<T extends ReplacementValues> {
  namespace: ReplaceableString<T>;
  object: ReplaceableString<T>;
  relation: ReplaceableString<T>;
  subjectIdOrSet: ReplaceableString<T> | SubjectSetWithReplacements<T>;
}

export const applyReplacements = <T extends ReplacementValues>(
  relationTuple: RelationTupleWithReplacements<T>,
  replacements: T,
): RelationTuple => {
  let subjectIdOrSet: RelationTuple['subjectIdOrSet'];
  if (typeof relationTuple.subjectIdOrSet === 'object') {
    subjectIdOrSet = {
      namespace: relationTuple.subjectIdOrSet.namespace(replacements),
      object: relationTuple.subjectIdOrSet.object(replacements),
      relation: relationTuple.subjectIdOrSet.relation(replacements),
    };
  } else {
    subjectIdOrSet = relationTuple.subjectIdOrSet(replacements);
  }

  return {
    namespace: relationTuple.namespace(replacements),
    object: relationTuple.object(replacements),
    relation: relationTuple.relation(replacements),
    subjectIdOrSet,
  };
};
