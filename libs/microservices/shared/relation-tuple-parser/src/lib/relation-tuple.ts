export class SubjectSet {
  namespace: string;
  object: string;
  relation?: string;
  constructor(namespace: string, object: string, relation?: string) {
    this.namespace = namespace;
    this.object = object;
    this.relation = relation;
  }
}

export class RelationTuple {
  namespace: string;
  object: string;
  relation: string;
  subjectIdOrSet: string | SubjectSet;
  constructor(
    namespace: string,
    object: string,
    relation: string,
    subjectIdOrSet: string | SubjectSet,
  ) {
    this.namespace = namespace;
    this.object = object;
    this.relation = relation;
    this.subjectIdOrSet = subjectIdOrSet;
  }
}
