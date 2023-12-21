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

type Namespace = string;
type TupleObject = string;
type Relation = string;
type SubjectId = string;
type SubjectNamespace = string;
type SubjectObject = string;
type SubjectRelation = string;

type RelationTupleString =
  | `${Namespace}`
  | `${Namespace}:${TupleObject}`
  | `${Namespace}:${TupleObject}#${Relation}`
  | `${Namespace}:${TupleObject}#${Relation}@${SubjectId}`
  | `${Namespace}:${TupleObject}#${Relation}@${SubjectNamespace}:${SubjectObject}`
  | `${Namespace}:${TupleObject}#${Relation}@${SubjectNamespace}:${SubjectObject}#${SubjectRelation}`
  | `${Namespace}:${TupleObject}#${Relation}@(${SubjectId})`
  | `${Namespace}:${TupleObject}#${Relation}@(${SubjectNamespace}:${SubjectObject})`
  | `${Namespace}:${TupleObject}#${Relation}@(${SubjectNamespace}:${SubjectObject}#${SubjectRelation})`;

/**
 * @description use Regex to parse a string into a RelationTuple instead of using antlr
 * @warn regex does not handle parentheses in subject parts
 **/
export function parseRelationTupleString(
  input: string,
): Result<RelationTuple, RelationTupleSyntaxError | UnknownError> {
  const regex =
    /^([^:]+)(?::([^#]+))?(?:#([^@]+)(?:@([^:]+)(?::([^#]+))?(?:#([^()]+(?:\([^()]+\))?)?)?)?)?$/;
  const match = input.match(regex);

  if (!match) {
    return error(
      new RelationTupleSyntaxError({
        data: {
          errors: [
            {
              wholeInput: input,
              line: 1,
              charPositionInLine: 0,
            },
          ],
        },
      }),
    );
  }

  const [
    ,
    namespace,
    object,
    relation,
    idOrNamespace,
    subjectObject,
    subjectRelation,
  ] = match;

  try {
    const result: RelationTuple = {
      namespace,
      object,
      relation,
      subjectIdOrSet: '',
    };

    if (subjectRelation) {
      result.subjectIdOrSet = {
        namespace: idOrNamespace || '',
        object: subjectObject || '',
        relation: subjectRelation,
      };
    } else if (subjectObject) {
      result.subjectIdOrSet = {
        namespace: idOrNamespace || '',
        object: subjectObject,
      };
    } else if (idOrNamespace) {
      result.subjectIdOrSet = idOrNamespace;
    }

    return value(result);
  } catch (e) {
    return error(new UnknownError({ data: e }));
  }
}

export const relationTupleToString = (
  tuple: Partial<RelationTuple>,
): RelationTupleString => {
  const base: `${string}:${string}#${string}` = `${tuple.namespace}:${tuple.object}#${tuple.relation}`;
  if (!tuple.subjectIdOrSet) {
    return base;
  }
  if (typeof tuple.subjectIdOrSet === 'string') {
    return `${base}@${tuple.subjectIdOrSet}`;
  }
  const { namespace, object, relation } = tuple.subjectIdOrSet;
  if (!relation) {
    return `${base}@${namespace}:${object}`;
  }
  return `${base}@${namespace}:${object}#${relation}`;
};
