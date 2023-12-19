import { defekt } from 'defekt';

export type RelationTupleSyntaxErrorDetail = {
  wholeInput: string;
  line: number;
  charPositionInLine: number;
  offendingSymbol?: string;
};

export class RelationTupleSyntaxError extends defekt<
  { errors: Array<RelationTupleSyntaxErrorDetail> },
  'RelationTupleSyntaxError'
>({
  code: 'RelationTupleSyntaxError',
}) {}
