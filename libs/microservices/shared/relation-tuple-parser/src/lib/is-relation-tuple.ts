import { RelationTuple } from './relation-tuple.js';
import { RelationTupleWithReplacements } from './with-replacements/relation-tuple-with-replacements.js';

export function isRelationTuple(
  x: RelationTuple | RelationTupleWithReplacements<never>,
): x is RelationTuple {
  return typeof x.namespace === 'string';
}
