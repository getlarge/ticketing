// Generated from RelationTuple.g4 by ANTLR 4.13.1

import { AbstractParseTreeVisitor } from 'antlr4ng';

import { RelationTupleContext } from './RelationTupleParser.js';
import { NamespacedObjectContext } from './RelationTupleParser.js';
import { SubjectContext } from './RelationTupleParser.js';
import { SubjectIdContext } from './RelationTupleParser.js';
import { SubjectSetContext } from './RelationTupleParser.js';

/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `RelationTupleParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export class RelationTupleVisitor<
  Result,
> extends AbstractParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `RelationTupleParser.relationTuple`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRelationTuple?: (ctx: RelationTupleContext) => Result;
  /**
   * Visit a parse tree produced by `RelationTupleParser.namespacedObject`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitNamespacedObject?: (ctx: NamespacedObjectContext) => Result;
  /**
   * Visit a parse tree produced by `RelationTupleParser.subject`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSubject?: (ctx: SubjectContext) => Result;
  /**
   * Visit a parse tree produced by `RelationTupleParser.subjectId`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSubjectId?: (ctx: SubjectIdContext) => Result;
  /**
   * Visit a parse tree produced by `RelationTupleParser.subjectSet`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSubjectSet?: (ctx: SubjectSetContext) => Result;
}
