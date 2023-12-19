import {
  AbstractParseTreeVisitor,
  ANTLRErrorListener,
  Recognizer,
  Token,
} from 'antlr4ng';

import {
  RelationTupleSyntaxError,
  RelationTupleSyntaxErrorDetail,
} from './errors/relation-tuple-syntax.error.js';
import {
  NamespacedObjectContext,
  RelationTupleContext,
  SubjectIdContext,
  SubjectSetContext,
} from './generated/antlr/RelationTupleParser.js';
import { RelationTupleVisitor } from './generated/antlr/RelationTupleVisitor.js';
import { RelationTuple } from './relation-tuple.js';

const DEFAULT_TUPLE: RelationTuple = {
  namespace: '',
  object: '',
  relation: '',
  subjectIdOrSet: '',
};

export class MyRelationTupleVisitor
  extends AbstractParseTreeVisitor<RelationTuple>
  implements RelationTupleVisitor<RelationTuple>
{
  protected override defaultResult(): RelationTuple {
    return {
      namespace: '',
      object: '',
      relation: '',
    } as RelationTuple;
  }

  override aggregateResult(
    aggregate: RelationTuple,
    nextResult: RelationTuple,
  ): RelationTuple {
    Object.assign(aggregate, nextResult);
    return aggregate;
  }

  visitRelationTuple(ctx: RelationTupleContext): RelationTuple {
    const aggregate = this.visitChildren(ctx) ?? DEFAULT_TUPLE;
    const namespacedObjectContext = ctx.namespacedObject();

    aggregate.relation = ctx._relation?.text ?? '';
    aggregate.namespace = namespacedObjectContext._namespace?.text ?? '';
    aggregate.object = namespacedObjectContext._object?.text ?? '';

    return aggregate;
  }

  visitSubjectId(ctx: SubjectIdContext): RelationTuple {
    const aggregate = this.visitChildren(ctx) ?? DEFAULT_TUPLE;
    aggregate.subjectIdOrSet = ctx?.getText();
    // aggregate.subjectIdOrSet = ctx.text

    return aggregate;
  }

  visitSubjectSet(ctx: SubjectSetContext): RelationTuple {
    const aggregate = this.visitChildren(ctx) ?? DEFAULT_TUPLE;

    let namespacedObjectContext: NamespacedObjectContext;
    try {
      namespacedObjectContext = ctx.namespacedObject();
    } catch (e) {
      throw new RelationTupleSyntaxError(
        `Expected SubjectSet to contain an namespaced object`,
      );
    }

    const subjectIdOrSet: RelationTuple['subjectIdOrSet'] = {
      namespace: namespacedObjectContext._namespace?.text ?? '',
      object: namespacedObjectContext._object?.text ?? '',
    };
    if (ctx._subjectRelation?.text != null) {
      subjectIdOrSet.relation = ctx._subjectRelation.text;
    }

    aggregate.subjectIdOrSet = subjectIdOrSet;

    return aggregate;
  }
}

export class MyParserErrorListener implements ANTLRErrorListener {
  private _errors: Array<RelationTupleSyntaxErrorDetail> = [];
  public get errors(): Array<RelationTupleSyntaxErrorDetail> {
    return this._errors;
  }

  constructor(private readonly wholeInput: string) {}

  syntaxError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognizer: Recognizer<any>,
    offendingSymbol: Token | null,
    line: number,
    charPositionInLine: number,
  ): void {
    const errorDetail = {
      wholeInput: this.wholeInput,
      line,
      charPositionInLine,
      offendingSymbol: offendingSymbol?.text ?? undefined,
    };

    this._errors.push(errorDetail);
  }

  reportAmbiguity(): void {
    throw new Error('Method not implemented.');
  }

  reportAttemptingFullContext(): void {
    throw new Error('Method not implemented.');
  }

  reportContextSensitivity(): void {
    throw new Error('Method not implemented.');
  }
}
