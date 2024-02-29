import type {
  Namespace,
  Context,
  SubjectSet,
} from '@ory/permission-namespace-types';

class User implements Namespace {}

class Group implements Namespace {
  related: {
    members: User[];
  };
}

class Moderation implements Namespace {
  related: {
    editors: SubjectSet<Group, 'members'>[];
  };

  permits = {
    edit: (ctx: Context) => this.related.editors.includes(ctx.subject),
    view: (ctx: Context) => this.permits.edit(ctx),
  };
}

class Ticket implements Namespace {
  related: {
    owners: User[];
  };

  permits = {
    edit: (ctx: Context) => this.related.owners.includes(ctx.subject),
    order: (ctx: Context) => !this.permits.edit(ctx),
  };
}

class Order implements Namespace {
  related: {
    parents: Ticket[];
    owners: User[];
  };

  permits = {
    view: (ctx: Context): boolean =>
      this.related.parents.traverse((t) =>
        t.related.owners.includes(ctx.subject),
      ) || this.related.owners.includes(ctx.subject),

    edit: (ctx: Context) => this.related.owners.includes(ctx.subject),
  };
}

class Payment implements Namespace {
  related: {
    parents: Order[];
    owners: User[];
  };

  permits = {
    view: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject) ||
      this.related.parents.traverse((t) => t.permits.view(ctx)),

    edit: (ctx: Context) => this.related.owners.includes(ctx.subject),
  };
}
