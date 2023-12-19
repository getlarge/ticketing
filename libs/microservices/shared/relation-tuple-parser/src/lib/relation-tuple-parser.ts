import { CharStreams, CommonTokenStream } from 'antlr4ng';
import { error, Result, value } from 'defekt';

import { RelationTupleSyntaxError } from './errors/relation-tuple-syntax.error.js';
import { UnknownError } from './errors/unknown.error.js';
import { RelationTupleLexer } from './generated/antlr/RelationTupleLexer.js';
import { RelationTupleParser } from './generated/antlr/RelationTupleParser.js';
import { RelationTuple } from './relation-tuple.js';
import {
  MyParserErrorListener,
  MyRelationTupleVisitor,
} from './relation-tuple-antlr.js';

/**
 * Parses the given string to a {@link RelationTuple}.
 * str syntax:
 * ```
 * <relation-tuple> ::= <object>'#'relation'@'<subject> | <object>'#'relation'@('<subject>')'
 * <object> ::= namespace':'object_id
 * <subject> ::= subject_id | <subject_set>
 * <subject_set> ::= <object>'#'relation
 * ```
 * example: `object#relation@subject`
 * The characters `:@#()` are reserved for syntax use only (=> forbidden in values)
 *
 * @param str
 * @return The parsed {@link RelationTuple} or {@link RelationTupleSyntaxError} in case of an invalid string.
 */
export const parseRelationTuple = (
  str: string,
): Result<RelationTuple, RelationTupleSyntaxError | UnknownError> => {
  const trimmedStr = str.trim();

  const inputStream = CharStreams.fromString(trimmedStr);
  const lexer = new RelationTupleLexer(inputStream);
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new RelationTupleParser(tokenStream);

  const parserErrorListener = new MyParserErrorListener(trimmedStr);

  parser.removeErrorListeners();
  parser.addErrorListener(parserErrorListener);
  const visitor = new MyRelationTupleVisitor();
  try {
    const parsedRelationTuple = visitor.visit(parser.relationTuple());

    if (!parsedRelationTuple || parserErrorListener.errors.length > 0) {
      return error(
        new RelationTupleSyntaxError({
          data: { errors: parserErrorListener.errors },
        }),
      );
    }

    return value(parsedRelationTuple);
  } catch (e) {
    if (e instanceof RelationTupleSyntaxError) {
      return error(e);
    }
    return error(new UnknownError({ data: e }));
  }
};

type RelationTupleString =
  | `${string}:${string}#${string}@${string}`
  | `${string}:${string}#${string}@${string}:${string}`
  | `${string}:${string}#${string}@${string}:${string}#${string}`
  | `${string}:${string}#${string}@(${string})`
  | `${string}:${string}#${string}@(${string}:${string})`
  | `${string}:${string}#${string}@(${string}:${string}#${string})`;

export const relationTupleToString = (
  tuple: RelationTuple,
): RelationTupleString => {
  const base: `${string}:${string}#${string}` = `${tuple.namespace}:${tuple.object}#${tuple.relation}`;
  if (typeof tuple.subjectIdOrSet === 'string') {
    return `${base}@${tuple.subjectIdOrSet}`;
  }
  const { namespace, object, relation } = tuple.subjectIdOrSet;
  if (!relation) {
    return `${base}@${namespace}:${object}`;
  }
  return `${base}@${namespace}:${object}#${relation}`;
};
