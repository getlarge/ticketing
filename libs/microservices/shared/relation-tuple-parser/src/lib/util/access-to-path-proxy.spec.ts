/* eslint-disable max-nested-callbacks */
/* eslint-disable max-lines-per-function */
import { createAccessToPathProxy } from './access-to-path-proxy.js';

describe('AccessToPathProxy tests', () => {
  describe('test different conversions', () => {
    it(`String(proxy.a)`, () => {
      type MyType = {
        a: string;
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(String(proxy.a)).toEqual('a');
    });

    it(`'' + proxy.a`, () => {
      type MyType = {
        a: string;
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect('' + proxy.a).toEqual('a');
    });

    it(`\`\${proxy.a}\``, () => {
      type MyType = {
        a: string;
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.a}`).toEqual('a');
    });
  });

  describe('in string template', () => {
    it(`create simple path`, () => {
      type MyType = {
        a: string;
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.a}`).toEqual('a');
    });

    it(`create simple path; multiple on root-layer`, () => {
      type MyType = {
        a: string;
        b: string;
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.a}`).toEqual('a');
      expect(`${proxy.b}`).toEqual('b');
    });

    it(`create nested path`, () => {
      type MyType = {
        nest: {
          a: string;
        };
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.nest.a}`).toEqual('nest.a');
    });

    it(`create nested path; multiple on layer 1`, () => {
      type MyType = {
        nest: {
          a: string;
          b: string;
        };
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.nest.a}`).toEqual('nest.a');
      expect(`${proxy.nest.b}`).toEqual('nest.b');
    });

    it(`create multiple layers nested path`, () => {
      type MyType = {
        nest: {
          nest: {
            nest: {
              nest: {
                a: string;
              };
            };
          };
        };
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.nest.nest.nest.nest.a}`).toEqual('nest.nest.nest.nest.a');
    });

    it(`create multiple layers nested path; multiple on layer 4`, () => {
      type MyType = {
        nest: {
          nest: {
            nest: {
              nest: {
                a: string;
                b: string;
              };
            };
          };
        };
      };
      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.nest.nest.nest.nest.a}`).toEqual('nest.nest.nest.nest.a');
      expect(`${proxy.nest.nest.nest.nest.b}`).toEqual('nest.nest.nest.nest.b');
    });

    it(`random layers`, () => {
      type MyType = {
        object: {
          namespace: string;
          object: string;
        };
        relation: string;
        nest: {
          nest: {
            subject: string;
          };
        };
      };

      const proxy = createAccessToPathProxy<MyType>((path) => path.join('.'));

      expect(`${proxy.object.namespace}`).toEqual('object.namespace');
      expect(`${proxy.object.object}`).toEqual('object.object');
      expect(`${proxy.relation}`).toEqual('relation');
      expect(`${proxy.nest.nest.subject}`).toEqual('nest.nest.subject');

      const { object, relation, nest } = proxy;
      expect(
        `${object.namespace}:${object.object}#${relation}@${nest.nest.subject}`,
      ).toEqual('object.namespace:object.object#relation@nest.nest.subject');
    });
  });
});
