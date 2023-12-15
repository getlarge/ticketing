export interface SubjectSet {
  namespace: string;
  object: string;
  relation?: string;
}

export interface RelationTuple {
  namespace: string;
  object: string;
  relation: string;
  subjectIdOrSet: string | SubjectSet;
}
