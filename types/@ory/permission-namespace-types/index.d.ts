// Copyright © 2023 Ory Corp
// SPDX-License-Identifier: Apache-2.0

/// <reference no-default-lib="true"/>

declare interface Boolean {}
declare interface String {}
declare interface Number {}
declare interface Function {}
declare interface Object {}
declare interface IArguments {}
declare interface RegExp {}

declare interface Array<T extends INamespace> {
  /**
   * Checks whether the elements of this Array have a Relation to the given Subject
   * @example
   * class File implements Namespace {
   *   related: {
   *     owners: (User | SubjectSet<Group, "members">)[]
   *   }
   *
   *   permits = {
   *     edit: (ctx: Context) => this.related.owners.includes(ctx.subject),
   *   }
   * }
   * @param element usually `ctx.subject`
   */
  includes(element: T): boolean;

  /**
   * Executes the {@link iteratorfn} on every element in the Array and evaluates to true if {@link iteratorfn} returns true for any element.
   *
   * @example
   * class File implements Namespace {
   *   related: {
   *     parents: (File | Folder)[]
   *   }
   *
   *   permits = {
   *     view: (ctx: Context): boolean =>
   *        // Checks whether the given context (e.g. subject) has view permissions on any of the parents,
   *        // effectively inhertiting the view permissions of the parents
   *       this.related.parents.traverse((p) => p.permits.view(ctx))
   *   }
   * }
   *
   * @param iteratorfn The function that checks if a connection exits
   */
  traverse(iteratorfn: (element: T) => boolean): boolean;
}

interface IContext {
  subject: never;
}

interface INamespace {
  /**
   * Possible Relations to Objects of Namespaces
   */
  related?: { [relation: string]: INamespace[] };

  /**
   * Dynamically computed Relations
   */
  permits?: { [method: string]: (ctx: IContext) => boolean };
}

declare module '@ory/permission-namespace-types' {
  export type Context = IContext;

  export type Namespace = INamespace;

  export type SubjectSet<
    A extends Namespace,
    R extends keyof A['related'],
  > = A['related'][R] extends Array<infer T> ? T : never;
}
