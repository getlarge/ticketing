/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
import { type RelationTuple } from '../relation-tuple.js';
import { applyReplacements } from './relation-tuple-with-replacements.js';
import { parseRelationTupleWithReplacements } from './relation-tuple-with-replacements-parser.js';

describe('parseRelationTupleWithReplacements tests', () => {
  it('simple replacements with subject', () => {
    const relationTupleWithReplacements = parseRelationTupleWithReplacements(
      ({ namespace, object, relation, subject }) =>
        `${namespace}:${object}#${relation}@${subject}`,
    ).unwrapOrThrow();

    const relationTuple = applyReplacements(relationTupleWithReplacements, {
      namespace: 'aaa',
      object: 'bbb',
      relation: 'ccc',
      subject: 'ddd',
    });

    expect(relationTuple).toEqual({
      namespace: 'aaa',
      object: 'bbb',
      relation: 'ccc',
      subjectIdOrSet: 'ddd',
    } as RelationTuple);
  });

  it('simple replacements with (subjectSet)', () => {
    const relationTupleWithReplacements = parseRelationTupleWithReplacements(
      ({
        namespace,
        object,
        relation,
        subjectNamespace,
        subjectObject,
        subjectRelation,
      }) =>
        `${namespace}:${object}#${relation}@(${subjectNamespace}:${subjectObject}#${subjectRelation})`,
    ).unwrapOrThrow();

    const relationTuple = applyReplacements(relationTupleWithReplacements, {
      namespace: 'aaa',
      object: 'bbb',
      relation: 'ccc',
      subjectNamespace: 'ddd',
      subjectObject: 'eee',
      subjectRelation: 'fff',
    });

    expect(relationTuple).toEqual({
      namespace: 'aaa',
      object: 'bbb',
      relation: 'ccc',
      subjectIdOrSet: {
        namespace: 'ddd',
        object: 'eee',
        relation: 'fff',
      },
    } as RelationTuple);
  });

  it('simple replacements with static part', () => {
    const relationTupleWithReplacements = parseRelationTupleWithReplacements(
      ({ namespace, object, relation, subject }) =>
        `*${namespace}*:*${object}*#*${relation}@${subject}*`,
    ).unwrapOrThrow();

    const relationTuple = applyReplacements(relationTupleWithReplacements, {
      namespace: 'aaa',
      object: 'bbb',
      relation: 'ccc',
      subject: 'ddd',
    });

    expect(relationTuple).toEqual({
      namespace: '*aaa*',
      object: '*bbb*',
      relation: '*ccc',
      subjectIdOrSet: 'ddd*',
    } as RelationTuple);
  });

  it('multiple replacements per part with subject', () => {
    const relationTupleWithReplacements = parseRelationTupleWithReplacements(
      ({ namespace, a, object, b, relation, c, subject, d }) =>
        `*${namespace}-${a}-${namespace}*:*${object}-${b}*#*${relation}-${c}*@*${subject}-${d}*`,
    ).unwrapOrThrow();

    const relationTuple = applyReplacements(relationTupleWithReplacements, {
      namespace: 'aaa',
      object: 'bbb',
      relation: 'ccc',
      subject: 'ddd',
      a: '1',
      b: '2',
      c: '3',
      d: '4',
    });

    expect(relationTuple).toEqual({
      namespace: '*aaa-1-aaa*',
      object: '*bbb-2*',
      relation: '*ccc-3*',
      subjectIdOrSet: '*ddd-4*',
    } as RelationTuple);
  });

  it('replacements support multiple types', () => {
    const replacements = {
      numberInt: 1,
      numberFP: 1.5,
      booleanTrue: true,
      booleanFalse: false,
      string: 'myTestString',
    };

    const relationTupleWithReplacements = parseRelationTupleWithReplacements(
      (r: typeof replacements) =>
        `${r.numberInt}|${r.numberFP}|${r.booleanTrue}|${r.booleanFalse}|${r.string}:object#relation@subject`,
    ).unwrapOrThrow();

    const relationTuple = applyReplacements(
      relationTupleWithReplacements,
      replacements,
    );

    expect(relationTuple).toEqual({
      namespace: '1|1.5|true|false|myTestString',
      object: 'object',
      relation: 'relation',
      subjectIdOrSet: 'subject',
    } as RelationTuple);
  });

  describe('nested replacements', () => {
    it('with subject', () => {
      const replacements = {
        object: {
          namespace: 'aaa',
          object: 'bbb',
        },
        relation: 'ccc',
        nest: {
          nest: {
            subject: 'ddd',
          },
        },
      };

      const relationTupleWithReplacements = parseRelationTupleWithReplacements<
        typeof replacements
      >(
        ({ object, relation, nest }) =>
          `${object.namespace}:${object.object}#${relation}@${nest.nest.subject}`,
      ).unwrapOrThrow();

      const relationTuple = applyReplacements(
        relationTupleWithReplacements,
        replacements,
      );

      expect(relationTuple).toEqual({
        namespace: 'aaa',
        object: 'bbb',
        relation: 'ccc',
        subjectIdOrSet: 'ddd',
      } as RelationTuple);
    });

    it('with subject and replacements inside parts', () => {
      const replacements = {
        object: {
          namespace: 'aaa',
          object: 'bbb',
        },
        relation: 'ccc',
        nest: {
          nest: {
            subject: 'ddd',
          },
        },
      };

      const relationTupleWithReplacements = parseRelationTupleWithReplacements<
        typeof replacements
      >(
        ({ object, relation, nest }) =>
          `${object.namespace}:${object.namespace}${object.object}#df${relation}dfg${nest.nest.subject}sdf@asd${nest.nest.subject}`,
      ).unwrapOrThrow();

      const relationTuple = applyReplacements(
        relationTupleWithReplacements,
        replacements,
      );

      expect(relationTuple).toEqual({
        namespace: 'aaa',
        object: 'aaabbb',
        relation: 'dfcccdfgdddsdf',
        subjectIdOrSet: 'asdddd',
      } as RelationTuple);
    });
  });
});
