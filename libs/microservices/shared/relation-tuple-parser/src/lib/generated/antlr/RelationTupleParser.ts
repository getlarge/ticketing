// Generated from RelationTuple.g4 by ANTLR 4.13.1

import * as antlr from 'antlr4ng';
import { Token } from 'antlr4ng';

import { RelationTupleVisitor } from './RelationTupleVisitor.js';

// for running tests with parameters, TODO: discuss strategy for typed parameters in CI
// eslint-disable-next-line no-unused-vars
type int = number;

export class RelationTupleParser extends antlr.Parser {
  public static readonly T__0 = 1;
  public static readonly T__1 = 2;
  public static readonly T__2 = 3;
  public static readonly T__3 = 4;
  public static readonly T__4 = 5;
  public static readonly STRING = 6;
  public static readonly CHAR = 7;
  public static readonly RULE_relationTuple = 0;
  public static readonly RULE_namespacedObject = 1;
  public static readonly RULE_subject = 2;
  public static readonly RULE_subjectId = 3;
  public static readonly RULE_subjectSet = 4;

  public static readonly literalNames = [
    null,
    "'#'",
    "'@'",
    "':'",
    "'('",
    "')'",
  ];

  public static readonly symbolicNames = [
    null,
    null,
    null,
    null,
    null,
    null,
    'STRING',
    'CHAR',
  ];
  public static readonly ruleNames = [
    'relationTuple',
    'namespacedObject',
    'subject',
    'subjectId',
    'subjectSet',
  ];

  public get grammarFileName(): string {
    return 'RelationTuple.g4';
  }
  public get literalNames(): (string | null)[] {
    return RelationTupleParser.literalNames;
  }
  public get symbolicNames(): (string | null)[] {
    return RelationTupleParser.symbolicNames;
  }
  public get ruleNames(): string[] {
    return RelationTupleParser.ruleNames;
  }
  public get serializedATN(): number[] {
    return RelationTupleParser._serializedATN;
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string,
  ): antlr.FailedPredicateException {
    return new antlr.FailedPredicateException(this, predicate, message);
  }

  public constructor(input: antlr.TokenStream) {
    super(input);
    this.interpreter = new antlr.ParserATNSimulator(
      this,
      RelationTupleParser._ATN,
      RelationTupleParser.decisionsToDFA,
      new antlr.PredictionContextCache(),
    );
  }
  public relationTuple(): RelationTupleContext {
    let localContext = new RelationTupleContext(this.context, this.state);
    this.enterRule(localContext, 0, RelationTupleParser.RULE_relationTuple);
    try {
      this.enterOuterAlt(localContext, 1);
      {
        this.state = 10;
        this.namespacedObject();
        this.state = 11;
        this.match(RelationTupleParser.T__0);
        this.state = 12;
        localContext._relation = this.match(RelationTupleParser.STRING);
        this.state = 13;
        this.match(RelationTupleParser.T__1);
        this.state = 14;
        this.subject();
        this.state = 15;
        this.match(RelationTupleParser.EOF);
      }
    } catch (re) {
      if (re instanceof antlr.RecognitionException) {
        localContext.exception = re;
        this.errorHandler.reportError(this, re);
        this.errorHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localContext;
  }
  public namespacedObject(): NamespacedObjectContext {
    let localContext = new NamespacedObjectContext(this.context, this.state);
    this.enterRule(localContext, 2, RelationTupleParser.RULE_namespacedObject);
    try {
      this.enterOuterAlt(localContext, 1);
      {
        this.state = 17;
        localContext._namespace = this.match(RelationTupleParser.STRING);
        this.state = 18;
        this.match(RelationTupleParser.T__2);
        this.state = 19;
        localContext._object = this.match(RelationTupleParser.STRING);
      }
    } catch (re) {
      if (re instanceof antlr.RecognitionException) {
        localContext.exception = re;
        this.errorHandler.reportError(this, re);
        this.errorHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localContext;
  }
  public subject(): SubjectContext {
    let localContext = new SubjectContext(this.context, this.state);
    this.enterRule(localContext, 4, RelationTupleParser.RULE_subject);
    try {
      this.state = 31;
      this.errorHandler.sync(this);
      switch (
        this.interpreter.adaptivePredict(this.tokenStream, 0, this.context)
      ) {
        case 1:
          this.enterOuterAlt(localContext, 1);
          {
            this.state = 21;
            this.subjectId();
          }
          break;
        case 2:
          this.enterOuterAlt(localContext, 2);
          {
            this.state = 22;
            this.subjectSet();
          }
          break;
        case 3:
          this.enterOuterAlt(localContext, 3);
          {
            this.state = 23;
            this.match(RelationTupleParser.T__3);
            this.state = 24;
            this.subjectId();
            this.state = 25;
            this.match(RelationTupleParser.T__4);
          }
          break;
        case 4:
          this.enterOuterAlt(localContext, 4);
          {
            this.state = 27;
            this.match(RelationTupleParser.T__3);
            this.state = 28;
            this.subjectSet();
            this.state = 29;
            this.match(RelationTupleParser.T__4);
          }
          break;
      }
    } catch (re) {
      if (re instanceof antlr.RecognitionException) {
        localContext.exception = re;
        this.errorHandler.reportError(this, re);
        this.errorHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localContext;
  }
  public subjectId(): SubjectIdContext {
    let localContext = new SubjectIdContext(this.context, this.state);
    this.enterRule(localContext, 6, RelationTupleParser.RULE_subjectId);
    try {
      this.enterOuterAlt(localContext, 1);
      {
        this.state = 33;
        this.match(RelationTupleParser.STRING);
      }
    } catch (re) {
      if (re instanceof antlr.RecognitionException) {
        localContext.exception = re;
        this.errorHandler.reportError(this, re);
        this.errorHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localContext;
  }
  public subjectSet(): SubjectSetContext {
    let localContext = new SubjectSetContext(this.context, this.state);
    this.enterRule(localContext, 8, RelationTupleParser.RULE_subjectSet);
    let _la: number;
    try {
      this.state = 41;
      this.errorHandler.sync(this);
      switch (
        this.interpreter.adaptivePredict(this.tokenStream, 2, this.context)
      ) {
        case 1:
          this.enterOuterAlt(localContext, 1);
          {
            this.state = 35;
            this.namespacedObject();
            this.state = 36;
            this.match(RelationTupleParser.T__0);
            this.state = 38;
            this.errorHandler.sync(this);
            _la = this.tokenStream.LA(1);
            if (_la === 6) {
              {
                this.state = 37;
                localContext._subjectRelation = this.match(
                  RelationTupleParser.STRING,
                );
              }
            }
          }
          break;
        case 2:
          this.enterOuterAlt(localContext, 2);
          {
            this.state = 40;
            this.namespacedObject();
          }
          break;
      }
    } catch (re) {
      if (re instanceof antlr.RecognitionException) {
        localContext.exception = re;
        this.errorHandler.reportError(this, re);
        this.errorHandler.recover(this, re);
      } else {
        throw re;
      }
    } finally {
      this.exitRule();
    }
    return localContext;
  }

  public static readonly _serializedATN: number[] = [
    4, 1, 7, 44, 2, 0, 7, 0, 2, 1, 7, 1, 2, 2, 7, 2, 2, 3, 7, 3, 2, 4, 7, 4, 1,
    0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2,
    1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 3, 2, 32, 8, 2, 1, 3, 1, 3,
    1, 4, 1, 4, 1, 4, 3, 4, 39, 8, 4, 1, 4, 3, 4, 42, 8, 4, 1, 4, 0, 0, 5, 0, 2,
    4, 6, 8, 0, 0, 43, 0, 10, 1, 0, 0, 0, 2, 17, 1, 0, 0, 0, 4, 31, 1, 0, 0, 0,
    6, 33, 1, 0, 0, 0, 8, 41, 1, 0, 0, 0, 10, 11, 3, 2, 1, 0, 11, 12, 5, 1, 0,
    0, 12, 13, 5, 6, 0, 0, 13, 14, 5, 2, 0, 0, 14, 15, 3, 4, 2, 0, 15, 16, 5, 0,
    0, 1, 16, 1, 1, 0, 0, 0, 17, 18, 5, 6, 0, 0, 18, 19, 5, 3, 0, 0, 19, 20, 5,
    6, 0, 0, 20, 3, 1, 0, 0, 0, 21, 32, 3, 6, 3, 0, 22, 32, 3, 8, 4, 0, 23, 24,
    5, 4, 0, 0, 24, 25, 3, 6, 3, 0, 25, 26, 5, 5, 0, 0, 26, 32, 1, 0, 0, 0, 27,
    28, 5, 4, 0, 0, 28, 29, 3, 8, 4, 0, 29, 30, 5, 5, 0, 0, 30, 32, 1, 0, 0, 0,
    31, 21, 1, 0, 0, 0, 31, 22, 1, 0, 0, 0, 31, 23, 1, 0, 0, 0, 31, 27, 1, 0, 0,
    0, 32, 5, 1, 0, 0, 0, 33, 34, 5, 6, 0, 0, 34, 7, 1, 0, 0, 0, 35, 36, 3, 2,
    1, 0, 36, 38, 5, 1, 0, 0, 37, 39, 5, 6, 0, 0, 38, 37, 1, 0, 0, 0, 38, 39, 1,
    0, 0, 0, 39, 42, 1, 0, 0, 0, 40, 42, 3, 2, 1, 0, 41, 35, 1, 0, 0, 0, 41, 40,
    1, 0, 0, 0, 42, 9, 1, 0, 0, 0, 3, 31, 38, 41,
  ];

  private static __ATN: antlr.ATN;
  public static get _ATN(): antlr.ATN {
    if (!RelationTupleParser.__ATN) {
      RelationTupleParser.__ATN = new antlr.ATNDeserializer().deserialize(
        RelationTupleParser._serializedATN,
      );
    }

    return RelationTupleParser.__ATN;
  }

  private static readonly vocabulary = new antlr.Vocabulary(
    RelationTupleParser.literalNames,
    RelationTupleParser.symbolicNames,
    [],
  );

  public override get vocabulary(): antlr.Vocabulary {
    return RelationTupleParser.vocabulary;
  }

  private static readonly decisionsToDFA =
    RelationTupleParser._ATN.decisionToState.map(
      (ds: antlr.DecisionState, index: number) => new antlr.DFA(ds, index),
    );
}

export class RelationTupleContext extends antlr.ParserRuleContext {
  public _relation?: Token | null;
  public constructor(
    parent: antlr.ParserRuleContext | null,
    invokingState: number,
  ) {
    super(parent, invokingState);
  }
  public namespacedObject(): NamespacedObjectContext {
    return this.getRuleContext(0, NamespacedObjectContext)!;
  }
  public subject(): SubjectContext {
    return this.getRuleContext(0, SubjectContext)!;
  }
  public EOF(): antlr.TerminalNode {
    return this.getToken(RelationTupleParser.EOF, 0)!;
  }
  public STRING(): antlr.TerminalNode {
    return this.getToken(RelationTupleParser.STRING, 0)!;
  }
  public override get ruleIndex(): number {
    return RelationTupleParser.RULE_relationTuple;
  }
  public override accept<Result>(
    visitor: RelationTupleVisitor<Result>,
  ): Result | null {
    if (visitor.visitRelationTuple) {
      return visitor.visitRelationTuple(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class NamespacedObjectContext extends antlr.ParserRuleContext {
  public _namespace?: Token | null;
  public _object?: Token | null;
  public constructor(
    parent: antlr.ParserRuleContext | null,
    invokingState: number,
  ) {
    super(parent, invokingState);
  }
  public STRING(): antlr.TerminalNode[];
  public STRING(i: number): antlr.TerminalNode | null;
  public STRING(i?: number): antlr.TerminalNode | null | antlr.TerminalNode[] {
    if (i === undefined) {
      return this.getTokens(RelationTupleParser.STRING);
    } else {
      return this.getToken(RelationTupleParser.STRING, i);
    }
  }
  public override get ruleIndex(): number {
    return RelationTupleParser.RULE_namespacedObject;
  }
  public override accept<Result>(
    visitor: RelationTupleVisitor<Result>,
  ): Result | null {
    if (visitor.visitNamespacedObject) {
      return visitor.visitNamespacedObject(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class SubjectContext extends antlr.ParserRuleContext {
  public constructor(
    parent: antlr.ParserRuleContext | null,
    invokingState: number,
  ) {
    super(parent, invokingState);
  }
  public subjectId(): SubjectIdContext | null {
    return this.getRuleContext(0, SubjectIdContext);
  }
  public subjectSet(): SubjectSetContext | null {
    return this.getRuleContext(0, SubjectSetContext);
  }
  public override get ruleIndex(): number {
    return RelationTupleParser.RULE_subject;
  }
  public override accept<Result>(
    visitor: RelationTupleVisitor<Result>,
  ): Result | null {
    if (visitor.visitSubject) {
      return visitor.visitSubject(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class SubjectIdContext extends antlr.ParserRuleContext {
  public constructor(
    parent: antlr.ParserRuleContext | null,
    invokingState: number,
  ) {
    super(parent, invokingState);
  }
  public STRING(): antlr.TerminalNode {
    return this.getToken(RelationTupleParser.STRING, 0)!;
  }
  public override get ruleIndex(): number {
    return RelationTupleParser.RULE_subjectId;
  }
  public override accept<Result>(
    visitor: RelationTupleVisitor<Result>,
  ): Result | null {
    if (visitor.visitSubjectId) {
      return visitor.visitSubjectId(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}

export class SubjectSetContext extends antlr.ParserRuleContext {
  public _subjectRelation?: Token | null;
  public constructor(
    parent: antlr.ParserRuleContext | null,
    invokingState: number,
  ) {
    super(parent, invokingState);
  }
  public namespacedObject(): NamespacedObjectContext {
    return this.getRuleContext(0, NamespacedObjectContext)!;
  }
  public STRING(): antlr.TerminalNode | null {
    return this.getToken(RelationTupleParser.STRING, 0);
  }
  public override get ruleIndex(): number {
    return RelationTupleParser.RULE_subjectSet;
  }
  public override accept<Result>(
    visitor: RelationTupleVisitor<Result>,
  ): Result | null {
    if (visitor.visitSubjectSet) {
      return visitor.visitSubjectSet(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}
