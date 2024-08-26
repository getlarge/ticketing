# 2 DESIGN AND IMPLEMENT A HYBRID APPLICATION

- [Design the moderation service](#design-the-moderation-service)
  - [Goal](#goal)
  - [Requirements](#requirements)
  - [References](#references)
  - [Flows](#flows)
    - [Ticket creation](#ticket-creation)
    - [Moderation process](#moderation-process)
  - [Architecture](#architecture)
  - [Events](#events)
  - [Entities](#entities)
  - [Permissions](#permissions)
- [Represent the domains](#represent-the-domains)
  - [Introduction](#introduction)
  - [1. Define domain Entities and DTOs](#1-define-domain-entities-and-dtos)
    - [1.1. Create Moderation model](#11-create-moderation-model)
    - [1.2. Update Ticket model](#12-update-ticket-model)
    - [1.3. Update existing MongoDB schemas](#13-update-existing-mongodb-schemas)
    - [1.4. Create MongoDB schemas](#14-create-mongodb-schemas)
      - [1.4.1. Create Moderation MongoDB schema](#141-create-moderation-mongodb-schema)
      - [1.4.2 Create Ticket MongoDB schema](#142-create-ticket-mongodb-schema)
    - [1.5. Update existing DTOs](#15-update-existing-dtos)
    - [1.6. Create Moderation DTOs](#16-create-moderation-dtos)
  - [2. Enable event exchanges](#2-enable-event-exchanges)
    - [2.1. External events](#21-external-events)
      - [2.1.1. Update enums](#211-update-enums)
      - [2.1.2. Create new events interfaces](#212-create-new-events-interfaces)
      - [2.1.3. Update the `EnvironmentVariables` class](#213-update-the-environmentvariables-class)
      - [2.1.4. Update `.env` file](#214-update-env-file)
    - [2.1.5. Switch to a micro-service application](#215-switch-to-a-micro-service-application)
    - [2.2. Internal events](#22-internal-events)
      - [2.2.1. Install @nestjs/event-emitter](#221-install-nestjsevent-emitter)
      - [2.2.2. Register EventEmitterModule](#222-register-eventemittermodule)
      - [2.2.3. Inventory events](#223-inventory-events)
  - [3. Create Domain modules](#3-create-domain-modules)
    - [3.1. For Ticket domain](#31-for-ticket-domain)
      - [3.1.1. Create TicketsModule](#311-create-ticketsmodule)
      - [3.1.2. Create TicketsService](#312-create-ticketsservice)
      - [3.1.3. Create TicketsMSController](#313-create-ticketsmscontroller)
    - [3.2. For Moderation domain](#32-for-moderation-domain)
      - [3.2.1 Create ModerationsModule](#321-create-moderationsmodule)
      - [3.2.2. Create ModerationsProcessor](#322-create-moderationsprocessor)
      - [3.2.3. Create ModerationsService](#323-create-moderationsservice)
      - [3.2.4. Create ModerationsController](#324-create-moderationscontroller)
    - [3.3. Update AppModule](#33-update-appmodule)
    - [3.4. Update ticket events handlers](#34-update-ticket-events-handlers)
      - [3.4.1. Add ticket.approved and ticket.rejected consumers in tickets micro-service](#341-add-ticketapproved-and-ticketrejected-consumers-in-tickets-micro-service)
      - [3.4.2. Update ticket.created producer in tickets micro-service](#342-update-ticketcreated-producer-in-tickets-micro-service)
      - [3.4.3. Update ticket.created consumer in **orders** micro-service](#343-update-ticketcreated-consumer-in-orders-micro-service)
- [Establish the moderation process](#establish-the-moderation-process)
  - [1. Protect routes](#1-protect-routes)
    - [1.1. Update the `EnvironmentVariables` class](#11-update-the-environmentvariables-class)
    - [1.2. Update `.env` file](#12-update-env-file)
    - [1.3. Import Ory modules](#13-import-ory-modules)
    - [1.4. Check user authentication](#14-check-user-authentication)
    - [1.5. Update Ory permissions](#15-update-ory-permissions)
    - [1.6. Add permission checks in ModerationsController](#16-add-permission-checks-in-moderationscontroller)
    - [1.7. Create relations in ModerationsService](#17-create-relations-in-moderationsservice)
  - [2. Create an automated moderation process](#2-create-an-automated-moderation-process)
    - [2.1. Guard against inappropriate ticket titles](#21-guard-against-inappropriate-ticket-titles)
    - [2.2. Integrate ContentGuardModule in ModerationsModule](#22-integrate-contentguardmodule-in-moderationsmodule)
  - [3. Create a manual moderation process](#3-create-a-manual-moderation-process)
    - [3.1. Assign categories thresholds](#31-assign-categories-thresholds)
    - [3.2. Allow moderators to approve or reject tickets](#32-allow-moderators-to-approve-or-reject-tickets)
  - [4. Time for some action](#4-time-for-some-action)
    - [4.1. Start the applications](#41-start-the-applications)
    - [4.2. Create a new user](#42-create-a-new-user)
    - [4.3. Verify the user's email](#43-verify-the-users-email)
    - [4.4. Test user login](#44-test-user-login)
    - [4.5. Add the user to the admin group](#45-add-the-user-to-the-admin-group)
    - [4.6. Testing the moderation process](#46-testing-the-moderation-process)
      - [4.6.1. Create a legitimate ticket](#461-create-a-legitimate-ticket)
      - [4.6.2. Create a ticket with a forbidden word in the title](#462-create-a-ticket-with-a-forbidden-word-in-the-title)
      - [4.6.3. Create a ticket with a title that contains violent speech](#463-create-a-ticket-with-a-title-that-contains-violent-speech)
      - [4.6.4. Create a ticket with a title that contains content hard (self-harm) to classify](#464-create-a-ticket-with-a-title-that-contains-content-hard-self-harm-to-classify)
      - [3.6.5. Approve a ticket](#365-approve-a-ticket)
      - [3.6.6. Reject a ticket](#366-reject-a-ticket)
    - [TODO](#todo)
- [Refine moderation process](#refine-moderation-process)
  - [1. Validate request inputs](#1-validate-request-inputs)
  - [2. Cache moderation results](#2-cache-moderation-results)
    - [2.1. Install dependencies](#21-install-dependencies)
    - [2.2. Register CacheModule](#22-register-cachemodule)
    - [2.3. Implement cache-aside strategy with Interceptors](#23-implement-cache-aside-strategy-with-interceptors)
    - [2.4. Implement cache-aside strategy with CacheManager instance](#24-implement-cache-aside-strategy-with-cachemanager-instance)
  - [3. Periodically check pending moderations](#3-periodically-check-pending-moderations)
    - [3.1. Install dependencies](#31-install-dependencies)
    - [3.2. Register SchedulersModule](#32-register-schedulersmodule)
    - [3.3. Implement Schedulers](#33-implement-schedulers)
  - [4. Handle and format errors](#4-handle-and-format-errors)
    - [4.1. Identify errors](#41-identify-errors)
    - [4.2. ExceptionFilters](#42-exceptionfilters)
    - [4.3. Retriable errors](#43-retriable-errors)
    - [4.4. Recoverable errors](#44-recoverable-errors)
    - [4.5. Acceptable errors](#45-acceptable-errors)
    - [4.6. Unidentified errors](#46-unidentified-errors)
  - [5. Send email notifications to moderators](#5-send-email-notifications-to-moderators)
    - [5.1. Install dependencies](#51-install-dependencies)
    - [5.2. Create MailerModule](#52-create-mailermodule)
    - [5.3. Create MailerService provider](#53-create-mailerservice-provider)
    - [5.4. Create email templates](#54-create-email-templates)
    - [5.4. Integrate MailerModule in moderation micro-service](#54-integrate-mailermodule-in-moderation-micro-service)
  - [TODOs](#todos)

# Design the moderation service

## Goal

In the ticketing app, we want to add a new functionality to moderate tickets before publishing them.
In other words, the tickets should only become public | visible after their approval.

## Requirements

- When a user creates a ticket, it should be automatically submitted for approval.
- Until approval, it should be pending and visible only to the user who created it.
- The approval should be done via a moderation service that processes the tickets with a moderation queue => fully asynchronous.
- The moderation service should be able to reject a ticket if it finds inappropriate content.
- The moderation should be automated unless the confidence level is low, which should be deferred to a human moderator.
- Ideally, the human moderator should be able to approve or reject the ticket via an admin-only API and/or via a secure email link.
- After approval, the ticket should be published and visible to everyone.
- After rejection, the ticket should be unpublished and visible only to the user who created it.
- When a user updates a ticket (`title`), it should be automatically submitted for approval (unless the title is immutable ?)
- As an admin user, fetching all moderations (paginated) or only one by its ID should be possible.
- As an admin user, checking the moderation job progress and status should be possible.

## References

- [Ticketing repository](https://github.com/getlarge/ticketing)
- [Discussion about profanity filtering on SO](https://stackoverflow.com/questions/273516/how-do-you-implement-a-good-profanity-filter)
- [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation/quickstart)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [DDD in Typescript](https://javascript.plainenglish.io/practical-ddd-in-typescript-entity-fc79002d0015)

## Flows

### Ticket creation

```mermaid
flowchart TD
    start([A user creates a new ticket offer])
    create[[Create the ticket]]
    moderate[/Wait for moderation/]
    moderation{Is this ticket<br>approved ?}
    approve[[Approve the ticket]]
    display[\Display the ticket publicly\]
    notify[\Notify the user\]
    ending([End])
    reject[[Reject the ticket]]

    start --> create
    create --> moderate
    moderate --> moderation
    moderation --yes--> approve
    moderation --"no"--> reject
    reject --> notify
    notify --> ending
    approve --> notify
    notify --> display
    display --> ending

```

### Moderation process

```mermaid
%%{wrap}%%
flowchart TD
    start([A ticket creation event is received])
    %% ensure the ticket is not already being (or is not already) moderated %%
    store[Store ticket]
    create[Create a moderation tracker]
    check1[[Check the ticket against a list of banned words]]
    moderation1{Is this ticket<br>matching ?}
    %% https://platform.openai.com/docs/guides/moderation/quickstart %%
    check2[[Check against OpenAI's Moderation API]]
    %% use confidence score to set acceptance thresholds via environment variables %%
    moderation2{Is the ticket flagged ?}
    moderation3{Is this ticket<br>approved ?}
    ending([End])

    %% The job is created after the moderation tracker, and we will assign the job Id to the moderation Id  %%
    %% Later an admin can use the moderation Id to retrieve the job status %%
    subgraph job
    job1[A moderation job is created] --> wait --> job2[The job is processed]
    end

    %% ticket is sent to a human moderator via email which contains signed URLs to approve/reject the ticket %%
    %% An API endpoint is also available to approve/reject tickets when logged in as an admin user %%
    subgraph manual_check
    check3a[\Send the ticket to a human moderator\] --> check3b[[Wait for human moderation]]
    end

    subgraph approval
    approve1[Set the moderation status to approved]--> approve2[\Emit a ticket:approved event\]
    end

    subgraph rejection
    reject1[Set the moderation status to rejected] --> reject2[\Emit a ticket:rejected event\]
    end

    start --> store --> create --> job --> check1 --> moderation1
    moderation1 --"yes"--> rejection
    moderation1 --"no"--> check2 --> moderation2

    moderation2 --"no"--> moderation2a{Is the confidence score<br>high enough ?}
    moderation2a --"yes"--> approval
    moderation2a --"no"-->  manual_check

    moderation2 --"yes"--> moderation2b{Is the confidence score<br>high enough ?}
    moderation2b --"yes"--> rejection
    moderation2b --"no"--> manual_check

    manual_check --> moderation3
    moderation3 --"yes"--> approval
    moderation3 --"no"--> rejection

    approval --> ending
    rejection --> ending
```

## Architecture

```mermaid
---
title: Ticketing architecture
---
flowchart LR
%% defining styles
    classDef app fill:#f7e081,stroke:#333,stroke-width:1px

%% defining entities
    FE[Angular app]
    LB[Nginx proxy]
    A[Auth API]
    A-M[(Mongo)]
    T[Tickets API]
    T-M[(Mongo)]
    O[Orders API]
    O-M[(Mongo)]
    P[Payments API]
    P-M[(Mongo)]
    St[Stripe]
    E[Expiration API]
    E-R[(Redis)]
    M[Moderations API]
    M-M[(Mongo)]
    M-R[(Redis)]
    O-AI[OpenAI]
    RMQ[RabbitMQ]
    Kr[Kratos]
    Ke[Keto]
    Hy[Hydra]

%% assigning styles to entities
    %%AS,OS,ES,TS,PS:::service
    %%class A,T,O,E,P,FE app;

%% flow
    FE -->|HTTP| LB
    FE -->|HTTP| St <-->|HTTP| PS
    FE -->|HTTP| ORY <-->|HTTP| AS
    MS -->|HTTP| O-AI
    LB --->|HTTP| AS & TS & OS & PS & MS
    RMQ <-.->|AMQP| TS & OS & ES & PS & MS
    TS & OS & PS & MS -->|HTTP| ORY
    subgraph AS [Auth service]
    direction LR
    A --> A-M
    end
    subgraph ORY [Ory Network]
    direction LR
    Kr
    Ke
    Hy
    end
    subgraph TS [Tickets service]
    direction LR
    T --> T-M
    end
    subgraph OS [Orders service]
    direction LR
    O --> O-M
    end
    subgraph ES [Expiration service]
    direction LR
    E <--> E-R
    end
    subgraph PS [Payments service]
    direction LR
    P --> P-M
    end
    subgraph MS [Moderations service]
    direction LR
    M --> M-M
    M --> M-R
    end


```

## Events

```mermaid
sequenceDiagram
  participant Tickets service
  participant Orders service
  participant Moderation service
  participant RMQ

  loop ticket:created
    %% event emitted by tickets service
    Tickets service->>+RMQ: Publish new ticket
    RMQ-->>-Moderation service: Dispatch new ticket
    Note left of Orders service: Moderation service needs to know <br> about new tickets to moderate them
  end

  loop ticket:approved
    %% event emitted by moderation service
    Moderation service->>+RMQ: Publish moderated ticket
    RMQ-->>Tickets service: Dispatch moderated ticket
    Note left of Tickets service: Tickets service needs to know <br> if tickets are approved to make them visible.
    RMQ-->>-Orders service: Dispatch moderated ticket
    Note left of Orders service: Orders service needs to know <br> about tickets that can be reserved.
  end

  loop ticket:rejected
    %% event emitted by moderation service
    Moderation service->>+RMQ: Publish moderated ticket
    RMQ-->>-Tickets service: Dispatch moderated ticket
    Note left of Tickets service: Tickets service needs to know <br> if tickets are rejected to make them invisible.
  end

  loop ticket:updated
    %% event emitted by tickets service
    Tickets service->>+RMQ: Publish updated ticket
    RMQ-->>-Orders service: Dispatch updated ticket
    Note left of Orders service: Orders service needs to know <br> if tickets price have changed and <br>if they are successfully reserved
  end

```

## Entities

```mermaid
classDiagram

    Moderation *-- Ticket : "parent"

    class TicketStatus {
        <<Enumeration>>
        -"waiting_moderation"
        -"approved"
        -"rejected"
    }

    class Ticket {
        +id: string
        +title: string
        +price: number
        +version: number
        +userId: string
        +status: TicketStatus
        +orderId?: string
    }

    class ModerationStatus {
        <<Enumeration>>
        -"pending"
        -"approved"
        -"rejected"
    }

    class Moderation {
        +id: string
        +status: ModerationStatus
        +ticketId: string
        -rejectionReason?: string
        -moderatorId?: string
    }
```

## Permissions

We must define a new namespace `Moderation` to allow only a specific `Group` of `Users` to moderate tickets.
Later, we will add `Users` to an **admin** `Group` and allow them to **edit** and **view** `Moderations`.

```mermaid
---
title: Entities namespaces and relationships
---
classDiagram

    NamespaceRelations *-- Namespace
    NamespacePermissions *-- Namespace
    Namespace <|-- User
    Namespace <|-- Group
    Namespace <|-- Ticket
    Namespace <|-- Order
    Namespace <|-- Payment
    Namespace <|-- Moderation
    Group o-- User : "members"
    Ticket o-- User : "owners"
    Order o-- User : "owners"
    Order *-- Ticket : "parents"
    Payment o-- User : "owners"
    Payment *-- Order : "parents"
    Moderation o-- Group : "editors"

    class Context {
      <<Interface>>
      subject: never;
    }

    class NamespaceRelations {
        <<Interface>>
        +[relation: string]: INamespace[]
    }

    class NamespacePermissions {
        <<Interface>>
        +[method: string]: (ctx: Context) => boolean
    }

    class Namespace {
        <<Interface>>
        -related?: NamespaceRelations
        -permits?: NamespacePermissions
    }

    class User {
    }

    note for Group "<i>Users</i> can be <b>members</b> of a <i>Group</i>"
    class Group {
        +related.members: User[]
    }

    note for Ticket "<i>Users</i> (in owners) are allowed to <b>edit</b>. \nHowever <i>Ticket</i> <b>owners</b> cannot <b>order</b> a Ticket. \nImplicitly, anyone can <b>view</b> Tickets"
    class Ticket {
        +related.owners: User[]
        +permits.edit(ctx: Context): boolean
        +permits.order(ctx: Context): boolean
    }

    note for Order "<i>Order</i> is bound to a <i>Ticket</i>. \n<i>Users</i> (in <b>owners</b>) are allowed to <b>view and edit</b>. \n <i>Order's Ticket</i> <b>owners</b> are allowed to <b>view</b>."
    class Order {
        +related.owners: User[]
        +related.parents: Tickets[]
        +permits.edit(ctx: Context): boolean
        +permits.view(ctx: Context): boolean
    }

    note for Payment "<i>Payment</i> is bound to a Ticket's <i>Order</i>. \n<i>Users</i> (in <b>owners</b>) are allowed to <b>view and edit</b>. \n<i>Payment</i> can be <b>viewed</b> by <i>Order's Ticket</i> <b>owners</b>."
    class Payment {
        +related.owners: User[]
        +related.parents: Order[]
        +permits.edit(ctx: Context): boolean
        +permits.view(ctx: Context): boolean
    }

    note for Moderation "Only <i>Users</i> from specific <i>Group</i> can <b>view and edit</b> <i>Moderation</i>.\n"
    class Moderation {
        +related.editors: Group.members[]
        +permits.edit(ctx: Context): boolean
        +permits.view(ctx: Context): boolean
    }
```

# Represent the domains

Following the requirements and design defined in the [previous exercise](./1-design-moderation-service.md), we will implement the Moderation service in this exercise.
We will apply **Domain Driven Design** (**DDD**) principles to implement the service and continue exploring NestJS techniques to do so.

We will work on the implementation in 3 phases:

1. Represent the domains

   - [Define domain Entities and DTOs](#1-define-domain-entities-and-dtos)
   - [Enable event exchanges](#2-enable-event-exchanges)
   - [Create Domain modules](#3-create-domain-modules)

2. [Establish moderation process](./2b-implement-moderation-service.md)

3. [Refine moderation process](./2c-implement-moderation-service.md)

## Introduction

- TODO: re-explain principles from https://docs.nestjs.com/microservices/basics
- TODO: explain directory structure and naming conventions

## 1. Define domain Entities and DTOs

<!-- region nestjs-workshop-phase-2a-chapter-1 -->

### 1.1. Create Moderation model

Let's start by creating the `Moderation` model with the properties defined in the [previous exercise](./1-design-moderation-service.md) and the validation constraints.

<details>
<summary>Solution</summary>

```ts
// libs/shared/models/src/moderation.ts
import { Expose, Type } from "class-transformer";
import {
  IsEnum,
  IsMongoId,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

import { Ticket } from "./ticket";

export class ModerationTicket
  implements Pick<Ticket, "id" | "title" | "price" | "version">
{
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsString({ message: "title must be a string" })
  title: string;

  @Expose()
  @IsNumber()
  price: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  version: number;
}

export enum ModerationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export class Moderation {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsEnum(ModerationStatus)
  status: ModerationStatus = ModerationStatus.Pending;

  @Expose()
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @Expose()
  @Type(() => ModerationTicket)
  @ValidateNested()
  @IsNotEmptyObject()
  ticket: ModerationTicket;

  @Expose()
  @IsOptional()
  @IsMongoId()
  moderatorId?: string;
}
```

And export the classes in `libs/shared/models/src/index.ts`.

</details>

### 1.2. Update Ticket model

Update the `Ticket` model to contain the `status` property.

<details>
<summary>Solution</summary>

```ts
// libs/shared/models/src/ticket.ts
import { Expose } from "class-transformer";
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from "class-validator";

export const ticketConstraints = {
  title: {
    min: 3,
    max: 56,
  },
  price: {
    min: 0,
  },
};

export enum TicketStatus {
  WaitingModeration = "waiting_moderation",
  Approved = "approved",
  Rejected = "rejected",
}

export class Ticket {
  @Expose()
  @IsMongoId()
  id: string;

  @Expose()
  @IsString({ message: "title must be a string" })
  @Length(ticketConstraints.title.min, ticketConstraints.title.max)
  title: string;

  @Expose()
  @IsNumber()
  @Min(ticketConstraints.price.min)
  price: number;

  @Expose()
  @IsEnum(TicketStatus)
  status: TicketStatus = TicketStatus.WaitingModeration;

  @Expose()
  @IsNumber()
  version: number;

  @Expose()
  @IsMongoId()
  userId: string;

  @Expose()
  @IsOptional()
  @IsMongoId()
  orderId?: string;
}
```

</details>

### 1.3. Update existing MongoDB schemas

Update the `TicketSchema` in the **tickets** micro-service to include the `status` property.:

<details>
<summary>Solution</summary>

```ts
// apps/tickets/src/app/tickets/schemas/ticket.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { TicketStatus } from "@ticketing/shared/models";
import { Document, Model } from "mongoose";

import { Ticket as TicketAttrs, ticketContraints } from "../models";

@Schema({
  toJSON: {
    transform(doc: TicketDocument, ret: TicketAttrs & { _id: string }) {
      ret.id = doc._id.toString();
      const { _id, ...rest } = ret;
      return rest;
    },
  },
  versionKey: "version",
})
export class Ticket implements TicketAttrs {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
    minlength: ticketContraints.title.min,
    maxlength: ticketContraints.title.max,
  })
  title: string;

  @Prop({ type: Number, required: true, min: ticketContraints.price.min })
  price: number;

  @Prop({ type: Number })
  version: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TicketStatus),
    default: TicketStatus.WaitingModeration,
  })
  status: TicketStatus;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    required: false,
  })
  orderId?: string;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

export interface TicketModel extends Model<TicketDocument> {
  build(attr: Omit<TicketAttrs, "id">): TicketDocument;
}
```

</details>

### 1.4. Create MongoDB schemas

#### 1.4.1. Create Moderation MongoDB schema

We will use a MongoDB schema to create and store the moderation entities in the **moderation** service's MongoDB database.

Add the following schema:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/schemas/moderation.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  Moderation as ModerationAttrs,
  ModerationStatus,
} from "@ticketing/shared/models";
import { Document, Model, Schema as MongooseSchema } from "mongoose";

import { Ticket } from "../../tickets/schemas";

@Schema({
  toJSON: {
    transform(doc: ModerationDocument, ret: ModerationAttrs & { _id: string }) {
      ret.id = doc._id.toString();
      const { _id, ...rest } = ret;
      return rest;
    },
  },
  versionKey: "version",
})
export class Moderation implements ModerationAttrs {
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "Ticket",
  })
  ticket: Ticket & Document;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ModerationStatus),
    default: ModerationStatus.Pending,
  })
  status: ModerationStatus;

  @Prop({
    type: String,
    required: false,
  })
  moderatorId?: string;

  @Prop({
    type: String,
    required: false,
  })
  rejectionReason?: string;

  @Prop({ type: Number })
  version: number;
}

export type ModerationDocument = Moderation & Document;

export const ModerationSchema = SchemaFactory.createForClass(Moderation);

export interface ModerationModel extends Model<ModerationDocument> {
  build(attr: Omit<ModerationAttrs, "id">): ModerationDocument;
}
```

And export the schema in `apps/moderation/src/app/moderations/schemas/index.ts`.

</details>

#### 1.4.2 Create Ticket MongoDB schema

We will use the same schema as the **order** service to store the tickets in the moderation service MongoDB database.

Add the following schema:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/tickets/schemas/ticket.schema.ts
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Ticket as TicketAttrs, TicketStatus } from "@ticketing/shared/models";
import type { Document, Model } from "mongoose";

import { Moderation, ModerationDocument } from "../../moderations/schemas";

@Schema({
  toJSON: {
    transform(doc: TicketDocument, ret: TicketAttrs & { _id: string }) {
      ret.id = doc._id.toString();
      const { _id, ...rest } = ret;
      return rest;
    },
  },
})
export class Ticket
  implements Pick<TicketAttrs, "title" | "price" | "status" | "version">
{
  @Prop({ type: String, virtual: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  id: any;

  @Prop({
    type: String,
    required: true,
  })
  title: string;

  @Prop({ type: Number, required: true, min: 0 })
  price: number;

  @Prop({ type: Number, required: true, default: 0 })
  version: number;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TicketStatus),
    default: TicketStatus.WaitingModeration,
  })
  status: TicketStatus;

  isModerated: () => Promise<boolean>;
}

export type TicketDocument = Ticket & Document;

export const TicketSchema = SchemaFactory.createForClass(Ticket);

export type TicketModel = Model<TicketDocument>;

TicketSchema.methods.isModerated = async function (): Promise<boolean> {
  const moderationModel = this.db.model(
    Moderation.name,
  ) as Model<ModerationDocument>;
  const existingModeration = await moderationModel.findOne({
    ticket: this as TicketDocument,
    // status: { $ne: ModerationStatus.Pending },
  });
  return !!existingModeration;
};
```

And export the schema in `apps/moderation/src/app/tickets/schemas/index.ts`.

</details>

### 1.5. Update existing DTOs

Update the `TicketDto` in the **tickets** micro-service.

<details>
<summary>Solution</summary>

```ts
// apps/tickets/src/app/tickets/models/ticket.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import {
  Ticket,
  ticketConstraints,
  TicketStatus,
} from "@ticketing/shared/models";

export class TicketDto extends Ticket {
  @ApiProperty({
    description: "Ticket database identifier",
    required: true,
  })
  declare id: string;

  @ApiProperty({
    description: "Ticket title",
    required: true,
    minLength: ticketConstraints.title.min,
    maxLength: ticketConstraints.title.max,
  })
  declare title: string;

  @ApiProperty({
    description: "Ticket price",
    required: true,
    minimum: ticketConstraints.price.min,
  })
  declare price: number;

  @ApiProperty({
    description:
      "Ticket version represented by a number incremented at each update",
    required: true,
  })
  declare version: number;

  @ApiProperty({
    description: "Ticket status",
    required: true,
    enum: Object.values(TicketStatus),
  })
  declare status: TicketStatus;

  @ApiProperty({
    description: "Ticket creator id",
    required: true,
  })
  declare userId: string;

  @ApiProperty({
    description: "Ticket reservation order id",
    required: false,
  })
  declare orderId?: string;
}
```

</details>

### 1.6. Create Moderation DTOs

To communicate with the other services, we will use DTOs.
The DTOs are used to :

- validate the data received from the external services
- document the API.

Add the following DTO:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/models/moderation.dto.ts
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  Moderation,
  ModerationStatus,
  ModerationTicket,
} from "@ticketing/shared/models";

export class ModerationTicketDto extends ModerationTicket {
  @ApiProperty({
    description: "Ticket database identifier",
  })
  declare id: string;

  @ApiProperty({
    description: "Ticket title",
  })
  declare title: string;

  @ApiProperty({
    description: "Ticket price",
  })
  declare price: number;

  @ApiProperty({
    description: "Ticket version",
  })
  declare version: number;
}

export class ModerationDto extends Moderation {
  @ApiProperty()
  declare id: string;

  @ApiProperty({
    description: "Moderation status",
    enum: Object.values(ModerationStatus),
  })
  declare status: ModerationStatus;

  @ApiPropertyOptional({
    description: "Moderation rejection reason",
  })
  declare rejectionReason?: string;

  @ApiProperty({
    description: "Moderation ticket",
    type: () => ModerationTicketDto,
  })
  declare ticket: Moderation["ticket"];

  @ApiPropertyOptional({
    description: "Moderation moderator id",
  })
  declare moderatorId?: string;
}
```

</details>

Add the `UpdateModerationDto` and `RejectModerationDto` to describe the update request body:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/models/update-moderation.dto.ts
import { PickType } from "@nestjs/swagger";

import { ModerationDto } from "./moderation.dto";

export class UpdateModerationDto extends PickType(ModerationDto, [
  "status",
  "rejectionReason",
] as const) {}

export class RejectModerationDto extends PickType(ModerationDto, [
  "rejectionReason",
] as const) {}
```

</details>

Add the `FilterModerationsDto` to describe the filter passed in the request query parameters:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/models/filter-moderations.dto.ts
import { PartialType, PickType } from "@nestjs/swagger";

import { ModerationDto } from "./moderation.dto";

export class FilterModerationsDto extends PartialType(
  PickType(ModerationDto, ["status"] as const),
) {}
```

</details>

Finally, export the DTOs in `apps/moderation/src/app/moderation/models/index.ts`.

<!-- endregion -->

## 2. Enable event exchanges

<!-- region nestjs-workshop-phase-2a-chapter-2 -->

To communicate with the other applications (external), we will use RabbitMQ queues.
Each (micro) service will have an assigned queue and produce messages to the other service queues.

We will use a global event bus to communicate with the other application domains (internal).
Each domain will produce events for the global event bus and will consume events from the global event bus.

### 2.1. External events

The moderation service will consume events from the tickets service (`ticket.created`) and will produce events for the **tickets** (`ticket.approved` and `ticket.rejected`) and **orders** services (`ticket.approved`).

#### 2.1.1. Update enums

Update the `Services` and `Resources` enums to declare the new service (`MODERATION_SERVICE`) and resource (`moderations`):

<details>
<summary>Solution</summary>

```ts
// libs/shared/constants/src/context.ts
export enum Services {
  AUTH_SERVICE = "AUTH_SERVICE",
  EXPIRATION_SERVICE = "EXPIRATION_SERVICE",
  MODERATION_SERVICE = "MODERATION_SERVICE",
  ORDERS_SERVICE = "ORDERS_SERVICE",
  PAYMENTS_SERVICE = "PAYMENTS_SERVICE",
  TICKETS_SERVICE = "TICKETS_SERVICE",
}

export enum Resources {
  EXPIRATION = "expiration",
  HEALTH = "health",
  GROUPS = "groups",
  MODERATIONS = "moderations",
  ORDERS = "orders",
  PAYMENTS = "payments",
  TICKETS = "tickets",
  USERS = "users",
  CLIENTS = "clients",
}

export enum Actions {
  CONFIRM = "confirm",
  CONFIRMED = "confirmed",
  CREATE_MANY = "create_many",
  CREATE_ONE = "create_one",
  CREATED_MANY = "created_many",
  CREATED_ONE = "created_one",
  DELETE_ALL = "delete_all",
  DELETE_MANY = "delete_many",
  DELETE_ONE = "delete_one",
  DELETED_MANY = "deleted_many",
  DELETED_ONE = "deleted_one",
  READ_MANY = "read_many",
  READ_ONE = "read_one",
  REPLACE_MANY = "replace_many",
  REPLACE_ONE = "replace_one",
  REPLACED_MANY = "replaced_many",
  REPLACED_ONE = "replaced_one",
  REVOKE = "revoke",
  REVOKED = "revoked",
  RESET = "reset",
  SIGN_IN = "sign_in",
  SIGN_OUT = "sign_out",
  SIGN_UP = "sign_up",
  UPDATE_MANY = "update_many",
  UPDATE_ONE = "update_one",
  UPDATED_MANY = "updated_many",
  UPDATED_ONE = "updated_one",
  VALIDATE_MANY = "validate_many",
  VALIDATE_ONE = "validate_one",
  ALL = "*",
}

export const CURRENT_USER_KEY = "user";
export const CURRENT_CLIENT_KEY = "client";
export const SESSION_ACCESS_TOKEN = "access_token";
```

</details>

Update the `Patterns` enum to declare the new events:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/events/src/patterns.ts
export enum Patterns {
  TicketCreated = "ticket.created",
  TicketUpdated = "ticket.updated",
  TicketApproved = "ticket.approved",
  TicketRejected = "ticket.rejected",
  OrderCreated = "order.created",
  OrderCancelled = "order.cancelled",
  ExpirationCompleted = "expiration.completed",
  PaymentCreated = "payment.created",
}
```

</details>

</details>

#### 2.1.2. Create new events interfaces

Define the interfaces for `TicketApprovedEvent` and `TicketRejectedEvent` in the `ticket-events.ts` file to describe the events produced by the **moderation** service and consumed by the **tickets** and **orders** services.

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/events/src/ticket-events.ts
import { OmitType } from "@nestjs/mapped-types";
import { Ticket, TicketStatus } from "@ticketing/shared/models";
import { Expose } from "class-transformer";
import { IsIn } from "class-validator";

import { Event } from "./event";
import { Patterns } from "./patterns";

export class TicketEventData extends Ticket {}

export class TicketCreatedEvent implements Event {
  static readonly data = TicketEventData;
  static readonly name = Patterns.TicketCreated as const;
  name = TicketCreatedEvent.name;
  data = new TicketCreatedEvent.data();
}

export class TicketUpdatedEvent implements Event {
  static readonly data = TicketEventData;
  static readonly name = Patterns.TicketUpdated as const;
  name = TicketUpdatedEvent.name;
  data = new TicketUpdatedEvent.data();
}

export class TicketApprovedEventData extends OmitType(Ticket, ["status"]) {
  @Expose()
  @IsIn([TicketStatus.Approved])
  status = TicketStatus.Approved;
}

export class TicketApprovedEvent implements Event {
  static readonly data = TicketApprovedEventData;
  static readonly name = Patterns.TicketApproved as const;
  name = TicketApprovedEvent.name;
  data = new TicketApprovedEvent.data();
}

class TicketRejectedEventData extends OmitType(Ticket, ["status"]) {
  @Expose()
  @IsIn([TicketStatus.Rejected])
  status = TicketStatus.Rejected;
}
export class TicketRejectedEvent implements Event {
  static readonly data = TicketRejectedEventData;
  static readonly name = Patterns.TicketRejected as const;
  name = TicketRejectedEvent.name;
  data = new TicketRejectedEvent.data();
}
```

</details>

Update the `EventMap` type to contain the new events interfaces and patterns:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/events/src/events-map.ts
import { ExpirationCompletedEvent } from "./expiration-events";
import { OrderCancelledEvent, OrderCreatedEvent } from "./order-events";
import { Patterns } from "./patterns";
import { PaymentCreatedEvent } from "./payment-events";
import {
  TicketApprovedEvent,
  TicketCreatedEvent,
  TicketRejectedEvent,
  TicketUpdatedEvent,
} from "./ticket-events";

export type EventsMap = {
  readonly [Patterns.TicketCreated]: TicketCreatedEvent["data"];
  readonly [Patterns.TicketUpdated]: TicketUpdatedEvent["data"];
  readonly [Patterns.TicketApproved]: TicketApprovedEvent["data"];
  readonly [Patterns.TicketRejected]: TicketRejectedEvent["data"];
  readonly [Patterns.OrderCreated]: OrderCreatedEvent["data"];
  readonly [Patterns.OrderCancelled]: OrderCancelledEvent["data"];
  readonly [Patterns.ExpirationCompleted]: ExpirationCompletedEvent["data"];
  readonly [Patterns.PaymentCreated]: PaymentCreatedEvent["data"];
};
```

</details>

#### 2.1.3. Update the `EnvironmentVariables` class

Modify `EnvironmentVariables` to support MongoDB, RabbitMQ, and Redis configurations.

- MongoDB is used to store the tickets and the moderations
- RabbitMQ is used to communicate with the other services
- Redis is used to store the jobs to be processed by the queue workers

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/env/index.ts
import { ConfigService } from "@nestjs/config";
import {
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
} from "@ticketing/microservices/shared/env";
import { Exclude } from "class-transformer";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Mixin } from "ts-mixer";

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "..", "..", "..", "..", "package.json");

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, "utf8"));

  APP_NAME?: string = "moderation";

  APP_VERSION?: string = this.pkg?.version || "0.0.1";
}
```

</details>

#### 2.1.4. Update `.env` file

Add the following variables:

<details>
<summary>Solution</summary>

```sh
# apps/moderation/.env
MONGODB_URI=mongodb://localhost:27017/moderation
NODE_ENV=development
PORT=3090
REDIS_URL=redis://localhost:6379
RMQ_URL=amqp://localhost:5672
RMQ_MANAGEMENT_API_URL=http://localhost:15672
SERVER_URL=http://localhost:3090
```

</details>

### 2.1.5. Switch to a micro-service application

First, we will transform the NestJS application from a pure HTTP-based application into a hybrid one by opening a micro-service connection using the `@nestjs/microservices` package. In other words, we will create an application that will listen to RabbitMQ queue messages (**consumer**) and HTTP requests.

We will integrate a custom implementation of the RabbitMQ transport that allows configuring exchanges and queues using the `@getlarge/nestjs-tools-amqp-transport` package. The default implementation of the RabbitMQ transport does not allow configuring exchanges.

> **Note:**
> By default a hybrid application will not inherit global pipes, interceptors, guards and filters configured for the main (HTTP-based) application. To inherit these configuration properties from the main application, set the `inheritAppConfig` property in the second argument (an optional options object) of the connectMicroservice() call, as follow

Update the bootstrap function to create a NestJS Fastify application and a micro-service connection:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/main.ts
import { AmqpOptions, AmqpServer } from "@getlarge/nestjs-tools-amqp-transport";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { CustomStrategy } from "@nestjs/microservices";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { GLOBAL_API_PREFIX } from "@ticketing/microservices/shared/constants";
import { Services } from "@ticketing/shared/constants";

import { AppModule } from "./app/app.module";
import { EnvironmentVariables } from "./app/env";
import { GlobalFilter } from "./app/filters/global.filter";
import { GlobalGuard } from "./app/guards/global.guard";
import { GlobalInterceptor } from "./app/interceptors/global.interceptor";
import { globalMiddleware } from "./app/middlewares/global.middleware";
import { GlobalPipe } from "./app/pipes/global.pipe";

const DEFAULT_PORT = 3090;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      bodyLimit: +process.env.MAX_PAYLOAD_SIZE || 1048576,
    }),
    { bufferLogs: true, abortOnError: false },
  );
  app.setGlobalPrefix(GLOBAL_API_PREFIX);
  app.enableShutdownHooks();

  app.use(globalMiddleware);
  app.useGlobalGuards(new GlobalGuard());
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.useGlobalPipes(new GlobalPipe());
  app.useGlobalFilters(new GlobalFilter());

  const configService =
    app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  const port = configService.get("PORT", { infer: true }) ?? DEFAULT_PORT;

  const amqpOptions: AmqpOptions = {
    urls: [configService.get("RMQ_URL") as string],
    persistent: true,
    noAck: false,
    prefetchCount: configService.get("RMQ_PREFETCH_COUNT"),
    isGlobalPrefetchCount: false,
    queue: `${Services.MODERATION_SERVICE}_QUEUE`,
    queueOptions: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
    socketOptions: {
      keepAlive: true,
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 1,
    },
  };
  const options: CustomStrategy = {
    strategy: new AmqpServer(amqpOptions),
  };
  const microService = app.connectMicroservice(options);
  await microService.listen();
  await app.listen(port, "0.0.0.0", () => {
    Logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

</details>

### 2.2. Internal events

We will use this event bus to send Ticket events from the Tickets module to the Moderation module and vice versa.

#### 2.2.1. Install @nestjs/event-emitter

```sh
yarn add @nestjs/event-emitter
```

#### 2.2.2. Register EventEmitterModule

To have a single event bus for the whole application, we will register the `EventEmitterModule` from `@nestjs/event-emitter` package in the `AppModule`.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/app.module.ts
import {
  BeforeApplicationShutdown,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AsyncLocalStorageModule } from "@ticketing/microservices/shared/async-local-storage";
import { validate } from "@ticketing/microservices/shared/env";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EnvironmentVariables } from "./env";
import { ModuleMiddleware } from "./middlewares/module.middleware";
import { RequestContextMiddleware } from "./middlewares/request-context.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validate(EnvironmentVariables),
    }),
    AsyncLocalStorageModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: "/",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule
  implements
    OnModuleDestroy,
    OnModuleInit,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown,
    NestModule
{
  readonly logger = new Logger(AppModule.name);

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ModuleMiddleware)
      .forRoutes(AppController)
      .apply(RequestContextMiddleware)
      .forRoutes(AppController);
  }

  onModuleInit(): void {
    this.logger.log(`initialized`);
  }

  onApplicationBootstrap(): void {
    this.logger.log(`bootstraped`);
  }

  onModuleDestroy(): void {
    this.logger.log(`destroyed`);
  }

  beforeApplicationShutdown(signal?: string): void {
    this.logger.log(`before shutdown ${signal}`);
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`shutdown ${signal}`);
  }
}
```

</details>

#### 2.2.3. Inventory events

Register the internal events names and types:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/shared/events.ts
import { Resources } from "@ticketing/shared/constants";
import {
  Moderation,
  ModerationStatus,
  ModerationTicket,
  Ticket,
  TicketStatus,
} from "@ticketing/shared/models";

export const enum EventStatus {
  CREATED = "created",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export type EventName = `${string}/${EventStatus}/*`;

export const TICKET_CREATED_EVENT = `${Resources.TICKETS}/${EventStatus.CREATED}/*`;
export const TICKET_APPROVED_EVENT = `${Resources.TICKETS}/${EventStatus.APPROVED}/*`;
export const TICKET_REJECTED_EVENT = `${Resources.TICKETS}/${EventStatus.REJECTED}/*`;

export type TicketEvent = { ticket: Ticket };
export type TicketCreatedEvent = TicketEvent & {
  ctx?: Record<string, unknown>;
};
export type TicketApprovedEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, "status"> & { status: TicketStatus.Approved };
  moderation: Omit<Moderation, "status"> & {
    status: ModerationStatus.Approved;
  };
  ctx?: Record<string, unknown>;
};
export type TicketRejectedEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, "status"> & { status: TicketStatus.Rejected };
  moderation: Omit<Moderation, "status"> & {
    status: ModerationStatus.Rejected;
  };
  ctx?: Record<string, unknown>;
};

export type EventsMap = {
  [TICKET_CREATED_EVENT]: TicketCreatedEvent;
  [TICKET_APPROVED_EVENT]: TicketApprovedEvent;
  [TICKET_REJECTED_EVENT]: TicketRejectedEvent;
};
```

And export the events in `apps/moderation/src/app/shared/index.ts`.

</details>

<!-- endregion -->

## 3. Create Domain modules

<!-- region nestjs-workshop-phase-2a-chapter-3 -->

In NestJS, we can use the modules to organize the code into domains.
Each module will have its own controllers, providers, services, schemas, models, etc. It will also import the modules it depends on.

### 3.1. For Ticket domain

The Ticket domain will be used to store the tickets, communicate with the **tickets** and **orders** micro-services (via the `TICKETS_CLIENT` and `ORDERS_CLIENT` RabbitMQ **producers**) and trigger internal events when a ticket is created.

#### 3.1.1. Create TicketsModule

Create the following module:

- to configure the RabbitMQ message producers
- to declare the MongoDB schemas
- to register the message consumers in `TicketsMSController`
- to provide the `TicketsService`

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/tickets/tickets.module.ts
import { AmqpClient, AmqpOptions } from "@getlarge/nestjs-tools-amqp-transport";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";
import { getReplyQueueName } from "@ticketing/microservices/shared/rmq";
import { Services } from "@ticketing/shared/constants";

import { AppConfigService } from "../env";
import { ModerationSchema } from "../moderations/schemas";
import { TicketSchema } from "./schemas";
import { TicketsService } from "./tickets.service";
import { TicketsMSController } from "./tickets-ms.controller";

const clientFactory = (
  configService: AppConfigService,
  consumerService: Services,
): CustomClientOptions => {
  const options: AmqpOptions = {
    urls: [configService.get("RMQ_URL") as string],
    persistent: true,
    noAck: true,
    prefetchCount: configService.get("RMQ_PREFETCH_COUNT"),
    isGlobalPrefetchCount: false,
    queue: `${consumerService}_QUEUE`,
    replyQueue: getReplyQueueName(consumerService, Services.MODERATION_SERVICE),
    queueOptions: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
    socketOptions: {
      keepAlive: true,
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 1,
    },
  };
  return {
    customClass: AmqpClient,
    options,
  };
};

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    ClientsModule.registerAsync([
      // this client is used to send ticket moderation events to the tickets micro-service
      {
        name: "TICKETS_CLIENT",
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.TICKETS_SERVICE),
            transport: Transport.RMQ,
          };
        },
      },
      // this client is used to send ticket moderation events to the orders micro-service
      {
        name: "ORDERS_CLIENT",
        inject: [ConfigService],
        useFactory: (configService: AppConfigService) => {
          return {
            ...clientFactory(configService, Services.ORDERS_SERVICE),
            transport: Transport.RMQ,
          };
        },
      },
    ]),
  ],
  controllers: [TicketsMSController],
  providers: [TicketsService],
  exports: [],
})
export class TicketsModule {}
```

</details>

#### 3.1.2. Create TicketsService

The `TicketsService` will handle the `ticket.created` event and send a`ticket.approved` or `ticket.rejected` event to the **tickets** and **orders** micro-services by using the `ClientProxy` from `@nestjs/microservices` package.

> **Note:**
>
> `ClientProxy` provides two methods to produce messages, `ClientProxy.send` and `ClientProxy.emit`, and both require a pattern to be passed as the first argument and a payload as the second argument. The difference between the two methods is that `send` is used for request-response (or RPC) communication, while `emit` is used for one-way communication (or fire-and-forget).
> For `send()` the pattern should match one defined in an @MessagePattern() decorator.
> For `emit()` the pattern should match one defined in an @EventPattern() decorator.

Create the following provider:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/tickets/tickets.service.ts
import { Inject, Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ClientProxy } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { EventsMap, Patterns } from "@ticketing/microservices/shared/events";
import { Ticket, TicketStatus } from "@ticketing/shared/models";
import type { Model } from "mongoose";
import { firstValueFrom, lastValueFrom, Observable, timeout, zip } from "rxjs";

import {
  type TicketApprovedEvent as InternalTicketApprovedEvent,
  type TicketCreatedEvent as InternalTicketCreatedEvent,
  type TicketRejectedEvent as InternalTicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { Ticket as TicketSchema, TicketDocument } from "./schemas";

type TicketWithStatus<S extends TicketStatus> = Omit<Ticket, "status"> & {
  status: S;
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject("TICKETS_CLIENT") private ticketsClient: ClientProxy,
    @Inject("ORDERS_CLIENT") private ordersClient: ClientProxy,
  ) {}

  async create(body: Ticket): Promise<void> {
    const ticket = await this.ticketModel.create({
      ...body,
      _id: body.id,
    });
    const event: InternalTicketCreatedEvent = {
      ticket: ticket.toJSON(),
      ctx: {},
    };
    try {
      await this.eventEmitter.emitAsync(TICKET_CREATED_EVENT, event);
    } catch (e) {
      await this.ticketModel.deleteOne({ _id: ticket.id });
      throw e;
    }
  }

  async updateById<S extends TicketStatus>(
    id: string,
    status: S,
  ): Promise<TicketWithStatus<S>> {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new Error(`Ticket not found - ${id}`);
    }
    ticket.set({ status });
    const updatedTicket = await ticket.save();
    return updatedTicket.toJSON() as TicketWithStatus<S>;
  }

  private sendMessage<
    R extends object,
    P extends Patterns.TicketApproved | Patterns.TicketRejected =
      | Patterns.TicketApproved
      | Patterns.TicketRejected,
    E extends EventsMap[P] = EventsMap[P],
  >(client: ClientProxy, pattern: P, event: E): Observable<R> {
    return client.send(pattern, event).pipe(timeout(5000));
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onApproved(event: InternalTicketApprovedEvent): Promise<void> {
    this.logger.debug(`onApproved ${JSON.stringify(event)}`);
    // TODO: wrap in transaction
    const ticket = await this.updateById(
      event.ticket.id,
      TicketStatus.Approved,
    );
    await lastValueFrom(
      zip(
        this.sendMessage<{ ok: boolean }>(
          this.ticketsClient,
          Patterns.TicketApproved,
          ticket,
        ),
        this.sendMessage<Ticket>(
          this.ordersClient,
          Patterns.TicketApproved,
          ticket,
        ),
      ),
    );
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onRejected(event: InternalTicketRejectedEvent): Promise<void> {
    // TODO: wrap in transaction
    this.logger.debug(`onRejected ${JSON.stringify(event)}`);
    const ticket = await this.updateById(
      event.ticket.id,
      TicketStatus.Rejected,
    );
    await firstValueFrom(
      this.sendMessage<{ ok: boolean }>(
        this.ticketsClient,
        Patterns.TicketRejected,
        ticket,
      ),
    );
  }
}
```

</details>

#### 3.1.3. Create TicketsMSController

To consume the `ticket.created` event from the **tickets** micro-service, we will use the `@nestjs/microservices` package and register an event listener with the `@MessagePattern` decorator.

The difference between the `@EventPattern` and `@MessagePattern` decorators is that the `@EventPattern` is used for one-way communication, while the `@MessagePattern` is used for request-response communication (RPC pattern).

Create the following controller:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/tickets/tickets-ms.controller.ts
import { Controller, Inject, Logger, ValidationPipe } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from "@nestjs/microservices";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { EventsMap, Patterns } from "@ticketing/microservices/shared/events";
import { requestValidationErrorFactory } from "@ticketing/shared/errors";
import type { Channel } from "amqp-connection-manager";
import type { Message } from "amqplib";

import { TicketsService } from "./tickets.service";

@Controller()
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketCreated, Transport.RMQ)
  async onCreated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      }),
    )
    data: EventsMap[Patterns.TicketCreated],
    @Ctx() context: RmqContext,
  ): Promise<{ ok: boolean }> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      await this.ticketsService.create(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      console.error(e);
      // TODO: requeue when error is timeout or connection error
      channel.nack(message, false, false);
      throw e;
    }
  }
}
```

</details>

### 3.2. For Moderation domain

The Moderation domain will store the moderations, manage the moderation process, allow admins to moderate tickets manually, and trigger internal events when a ticket is approved or rejected.

#### 3.2.1 Create ModerationsModule

Create the following module:

- to configure the BullMQ queue where the moderation process will be executed
- to declare the MongoDB schemas
- to register the `ModerationsProcessor` to consume from the `moderate-ticket` queue
- to provide the `ModerationsService`

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.module.ts
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import type { RedisOptions } from "ioredis";
import { URL } from "node:url";

import { QueueNames } from "../shared/queues";
import { TicketSchema } from "../tickets/schemas";
import { ModerationsController } from "./moderations.controller";
import { ModerationsProcessor } from "./moderations.processor";
import { ModerationsService } from "./moderations.service";
import { ModerationSchema } from "./schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService],
})
export class ModerationsModule {}
```

</details>

#### 3.2.2. Create ModerationsProcessor

To execute the moderation logic asynchronously, we will use queues. We will use the `@nestjs/bullmq` package to create a queue for the moderation process.

Install `@nestjs/bullmq` package:

```sh
yarn add @nestjs/bullmq bullmq
```

Create queues enum and interface:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/shared/queues.ts
import { Moderation, ModerationTicket } from "@ticketing/shared/models";

export enum QueueNames {
  MODERATE_TICKET = "moderate-ticket",
}

export interface ModerateTicket {
  ticket: ModerationTicket;
  moderation: Moderation;
  ctx?: Record<string, unknown>;
}
```

</details>

The processor will consume from the `moderate-ticket` queue and emit events to the global event bus to notify the other providers (`TicketsService` and `ModerationService`) of the moderation status changes.

Create the following processor:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AsyncLocalStorageService } from "@ticketing/microservices/shared/async-local-storage";
import { ModerationStatus, TicketStatus } from "@ticketing/shared/models";
import type { Job } from "bullmq";

import {
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";

@Processor(QueueNames.MODERATE_TICKET)
export class ModerationsProcessor extends WorkerHost {
  readonly logger = new Logger(ModerationsProcessor.name);

  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(AsyncLocalStorageService)
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
  ) {
    super();
  }

  private async emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, event);
  }

  async process(
    job: Job<ModerateTicket>,
  ): Promise<{ status: ModerationStatus }> {
    const { ctx, ticket, moderation } = job.data;
    this.asyncLocalStorageService.enter();
    this.asyncLocalStorageService.set("REQUEST_CONTEXT", ctx);
    const { status } = await this.moderateTicket(job.data);
    switch (status) {
      case ModerationStatus.Approved:
        await this.emitEventAsync(TICKET_APPROVED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Approved },
          ticket: { ...ticket, status: TicketStatus.Approved },
        });
        break;
      case ModerationStatus.Rejected:
        await this.emitEventAsync(TICKET_REJECTED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Rejected },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      // TODO: create another status for moderation requiring human intervention
      case ModerationStatus.Pending:
        // TODO: notify moderation team
        break;
      default:
        break;
    }
    return { status };
  }

  // TODO: implement moderation logic
  private moderateTicket(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    jobData: ModerateTicket,
  ): Promise<{ status: ModerationStatus; rejectionReason?: string }> {
    return Promise.resolve({ status: ModerationStatus.Pending });
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<ModerateTicket>): void {
    this.logger.log(`Job: ${QueueNames.MODERATE_TICKET}-${job.id} completed`);
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("error")
  onError(error: Error): void {
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET} errored : ${error.message}`,
    );
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<ModerateTicket>, error: Error): void {
    const { failedReason } = job;
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET}-${job.id} failed : ${failedReason}`,
    );
    this.asyncLocalStorageService.exit();
  }
}
```

</details>

#### 3.2.3. Create ModerationsService

Create the following provider:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.service.ts
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Moderation, ModerationStatus } from "@ticketing/shared/models";
import { Queue } from "bullmq";
import { Model, Types } from "mongoose";

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";
import { FilterModerationsDto, UpdateModerationDto } from "./models";
import { Moderation as ModerationSchema, ModerationDocument } from "./schemas";

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    @InjectModel(ModerationSchema.name)
    private moderationModel: Model<ModerationDocument>,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel
        .findOne({
          "ticket.$id": event.ticket.id,
        })
        .session(session);
      if (existingModeration) {
        // TODO: check whether moderation is pending,
        throw new Error(
          `Ticket moderation already exists - ${existingModeration.id}`,
        );
      }
      const res = await this.moderationModel.create(
        [
          {
            ticket: Types.ObjectId.createFromHexString(event.ticket.id),
            status: ModerationStatus.Pending,
          },
        ],
        { session },
      );
      await res[0].populate("ticket");
      const moderation = res[0].toJSON<Moderation>();
      this.logger.debug(`Created moderation ${moderation.id}`);

      const job = await this.moderationProcessor.add(
        "moderate-ticket",
        { ticket: event.ticket, ctx: event.ctx, moderation },
        {
          attempts: 2,
          delay: 1000,
          jobId: moderation.id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.debug(`Created job ${job.id}`);
      return moderation;
    });
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketApproved(event: TicketApprovedEvent): Promise<void> {
    this.logger.log(`onTicketApproved ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Approved,
    });
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketRejected(event: TicketRejectedEvent): Promise<void> {
    this.logger.log(`onTicketRejected ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Rejected,
    });
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  async findById(id: string): Promise<Moderation> {
    const moderation = await this.moderationModel
      .findOne({
        _id: id,
      })
      .populate("ticket");

    if (!moderation) {
      throw new NotFoundException(`Moderation not found - ${id}`);
    }
    return moderation.toJSON<Moderation>();
  }

  async updateById(
    id: string,
    update: UpdateModerationDto,
  ): Promise<Moderation> {
    const existingModeration = await this.moderationModel.findOne({
      _id: id,
    });
    existingModeration.set(update);
    const moderation = await existingModeration.save();
    await moderation.populate("ticket");
    return moderation.toJSON<Moderation>();
  }
}
```

</details>

#### 3.2.4. Create ModerationsController

Create the following controller:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ParseObjectId } from "@ticketing/microservices/shared/pipes";
import { Resources } from "@ticketing/shared/constants";

import { FilterModerationsDto, ModerationDto } from "./models";
import { ModerationsService } from "./moderations.service";

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @Get()
  find(@Query() params: FilterModerationsDto): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @Get(":id")
  findById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }
}
```

</details>

### 3.3. Update AppModule

Update the `AppModule` to import `MongooseModule`, `TicketsModule` and `ModerationModule`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/app.module.ts
import {
  BeforeApplicationShutdown,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { AsyncLocalStorageModule } from "@ticketing/microservices/shared/async-local-storage";
import { validate } from "@ticketing/microservices/shared/env";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppConfigService, EnvironmentVariables } from "./env";
import { ModuleMiddleware } from "./middlewares/module.middleware";
import { RequestContextMiddleware } from "./middlewares/request-context.middleware";
import { ModerationsModule } from "./moderations/moderations.module";
import { TicketsModule } from "./tickets/tickets.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate: validate(EnvironmentVariables),
    }),
    AsyncLocalStorageModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: "/",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        uri: configService.get<string>("MONGODB_URI"),
      }),
    }),
    TicketsModule,
    ModerationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule
  implements
    OnModuleDestroy,
    OnModuleInit,
    OnApplicationBootstrap,
    OnApplicationShutdown,
    BeforeApplicationShutdown,
    NestModule
{
  readonly logger = new Logger(AppModule.name);

  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ModuleMiddleware)
      .forRoutes(AppController)
      .apply(RequestContextMiddleware)
      .forRoutes(AppController);
  }

  onModuleInit(): void {
    this.logger.log(`initialized`);
  }

  onApplicationBootstrap(): void {
    this.logger.log(`bootstraped`);
  }

  onModuleDestroy(): void {
    this.logger.log(`destroyed`);
  }

  beforeApplicationShutdown(signal?: string): void {
    this.logger.log(`before shutdown ${signal}`);
  }

  onApplicationShutdown(signal?: string): void {
    this.logger.log(`shutdown ${signal}`);
  }
}
```

</details>

### 3.4. Update ticket events handlers

#### 3.4.1. Add ticket.approved and ticket.rejected consumers in tickets micro-service

Declare new message consumers in the **tickets** micro-service in the `TicketsMSController` to handle the `ticket.approved` and `ticket.rejected` events.

<details>
<summary>Solution</summary>

```ts
// apps/tickets/src/app/tickets/tickets-ms.controller.ts
import {
  Controller,
  Inject,
  Logger,
  ValidationPipe,
  ValidationPipeOptions,
} from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from "@nestjs/microservices";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { EventsMap, Patterns } from "@ticketing/microservices/shared/events";
import { requestValidationErrorFactory } from "@ticketing/shared/errors";
import { Ticket } from "@ticketing/shared/models";
import type { Channel } from "amqp-connection-manager";
import type { Message } from "amqplib";

import { TicketsService } from "../tickets/tickets.service";

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@Controller()
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  private async updateStatusById(
    data: Ticket,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      await this.ticketsService.updateStatusById(data.id, data.status);
      channel.ack(message);
    } catch (e) {
      channel.nack(message, false, false);
      throw e;
    }
  }

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketApproved, Transport.RMQ)
  async onApproved(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: EventsMap[Patterns.TicketApproved],
    @Ctx() context: RmqContext,
  ): Promise<{ ok: boolean }> {
    await this.updateStatusById(data, context);
    return { ok: true };
  }

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketRejected, Transport.RMQ)
  async onRejected(
    @Payload(new ValidationPipe(validationPipeOptions))
    data: EventsMap[Patterns.TicketApproved],
    @Ctx() context: RmqContext,
  ): Promise<{ ok: boolean }> {
    await this.updateStatusById(data, context);
    return { ok: true };
  }
}
```

</details>

#### 3.4.2. Update ticket.created producer in tickets micro-service

In `apps/tickets/src/app/shared/constants.ts` add the following injection token:

<details>

```diff
+ export const MODERATIONS_CLIENT = 'MODERATIONS_CLIENT';
```

</details>

Register `MODERATIONS_CLIENT` consumer in `TicketsModule`:

<details>
<summary>Solution</summary>

```ts
// apps/tickets/src/app/tickets/tickets.module.ts
import { OryOAuth2Module } from "@getlarge/hydra-client-wrapper";
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from "@getlarge/keto-client-wrapper";
import { OryFrontendModule } from "@getlarge/kratos-client-wrapper";
import { AmqpClient, AmqpOptions } from "@getlarge/nestjs-tools-amqp-transport";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import {
  ClientsModule,
  CustomClientOptions,
  Transport,
} from "@nestjs/microservices";
import { MongooseModule } from "@nestjs/mongoose";
import { GlobalErrorFilter } from "@ticketing/microservices/shared/filters";
import {
  OryAuthenticationGuard,
  OryOAuth2AuthenticationGuard,
} from "@ticketing/microservices/shared/guards";
import { getReplyQueueName } from "@ticketing/microservices/shared/rmq";
import { Services } from "@ticketing/shared/constants";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import { AppConfigService, EnvironmentVariables } from "../env";
import {
  MODERATIONS_CLIENT,
  ORDERS_CLIENT,
  ORY_AUTH_GUARD,
  ORY_OAUTH2_GUARD,
} from "../shared/constants";
import { Ticket, TicketSchema } from "./schemas/ticket.schema";
import { TicketsController } from "./tickets.controller";
import { TicketsService } from "./tickets.service";
import { TicketsMSController } from "./tickets-ms.controller";

const MongooseFeatures = MongooseModule.forFeatureAsync([
  {
    name: Ticket.name,
    useFactory: () => {
      const schema = TicketSchema;
      schema.plugin(updateIfCurrentPlugin);
      return schema;
    },
    inject: [ConfigService],
  },
]);

const clientFactory = (
  configService: AppConfigService,
  consumerService: Services,
): CustomClientOptions => {
  const options: AmqpOptions = {
    urls: [configService.get("RMQ_URL") as string],
    persistent: true,
    noAck: true,
    prefetchCount: configService.get("RMQ_PREFETCH_COUNT"),
    isGlobalPrefetchCount: false,
    queue: `${consumerService}_QUEUE`,
    replyQueue: getReplyQueueName(consumerService, Services.TICKETS_SERVICE),
    queueOptions: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
    socketOptions: {
      keepAlive: true,
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 1,
    },
  };
  return {
    customClass: AmqpClient,
    options,
  };
};

const Clients = ClientsModule.registerAsync([
  {
    name: ORDERS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: AppConfigService) => {
      const clientOptions = clientFactory(
        configService,
        Services.ORDERS_SERVICE,
      );
      return { ...clientOptions, transport: Transport.RMQ };
    },
  },
  {
    name: MODERATIONS_CLIENT,
    inject: [ConfigService],
    useFactory: (configService: AppConfigService) => {
      const clientOptions = clientFactory(
        configService,
        Services.MODERATION_SERVICE,
      );
      return { ...clientOptions, transport: Transport.RMQ };
    },
  },
]);

@Module({
  imports: [
    MongooseFeatures,
    Clients,
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get("ORY_KRATOS_PUBLIC_URL"),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get("ORY_KETO_PUBLIC_URL"),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        accessToken: configService.get("ORY_KETO_API_KEY"),
        basePath: configService.get("ORY_KETO_ADMIN_URL"),
      }),
    }),
    OryOAuth2Module.forRootAsync({
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<EnvironmentVariables, true>,
      ) => ({
        basePath: configService.get("ORY_HYDRA_PUBLIC_URL"),
        accessToken: configService.get("ORY_HYDRA_API_KEY"),
      }),
    }),
  ],
  controllers: [TicketsController, TicketsMSController],
  providers: [
    {
      provide: APP_FILTER,
      useExisting: GlobalErrorFilter,
    },
    GlobalErrorFilter,
    TicketsService,
    {
      provide: ORY_AUTH_GUARD,
      useClass: OryAuthenticationGuard(),
    },
    {
      provide: ORY_OAUTH2_GUARD,
      useClass: OryOAuth2AuthenticationGuard(),
    },
  ],
  exports: [MongooseFeatures, Clients, TicketsService],
})
export class TicketsModule {}
```

</details>

Replace consumer by `MODERATIONS_CLIENT`

<details>
<summary>Solution</summary>

```ts
// apps/tickets/src/app/tickets/tickets.service.ts
import { OryRelationshipsService } from "@getlarge/keto-client-wrapper";
import {
  createRelationQuery,
  relationTupleBuilder,
} from "@getlarge/keto-relations-parser";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Relationship } from "@ory/client";
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  Patterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@ticketing/microservices/shared/events";
import {
  NextPaginationDto,
  PaginateDto,
  PermissionNamespaces,
} from "@ticketing/microservices/shared/models";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Resources } from "@ticketing/shared/constants";
import { User } from "@ticketing/shared/models";
import { Model } from "mongoose";
import { Paginator } from "nestjs-keyset-paginator";
import { lastValueFrom, timeout } from "rxjs";

import { MODERATIONS_CLIENT, ORDERS_CLIENT } from "../shared/constants";
import { CreateTicket, Ticket, UpdateTicket } from "./models";
import { Ticket as TicketSchema, TicketDocument } from "./schemas";

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name)
    private readonly ticketModel: Model<TicketDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @Inject(ORDERS_CLIENT) private readonly ordersClient: ClientProxy,
    @Inject(MODERATIONS_CLIENT) private readonly moderationClient: ClientProxy,
  ) {}

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    let createdRelation: Relationship | undefined;
    try {
      await using manager = await transactionManager(this.ticketModel);
      const res = await manager.wrap<Ticket>(async (session) => {
        const doc: CreateTicket & { userId: string } = {
          ...ticket,
          userId: currentUser.id,
        };
        const docs = await this.ticketModel.create([doc], {
          session,
        });
        const newTicket = docs[0].toJSON<Ticket>();
        this.logger.debug(`Created ticket ${newTicket.id}`);

        const relationTuple = relationTupleBuilder()
          .subject(PermissionNamespaces[Resources.USERS], currentUser.id)
          .isIn("owners")
          .of(PermissionNamespaces[Resources.TICKETS], newTicket.id);
        const createRelationshipBody = createRelationQuery(
          relationTuple.toJSON(),
        ).unwrapOrThrow();
        const { data } = await this.oryRelationshipsService.createRelationship({
          createRelationshipBody,
        });
        createdRelation = data;
        this.logger.debug(`Created relation ${relationTuple.toString()}`);

        await lastValueFrom(
          this.moderationClient
            .send<
              TicketCreatedEvent["name"],
              TicketCreatedEvent["data"]
            >(Patterns.TicketCreated, newTicket)
            .pipe(timeout(5000)),
        );
        this.logger.debug(`Sent event ${Patterns.TicketCreated}`);
        return newTicket;
      });

      if (res.error) {
        throw res.error;
      }
      return res.value;
    } catch (error) {
      if (createdRelation) {
        await this.oryRelationshipsService.deleteRelationships(createdRelation);
      }
      throw error;
    }
  }

  paginate(params: PaginateDto = {}): Promise<{
    docs: TicketDocument[];
    next_key: { key: string; value: string }[];
  }> {
    const { skip = 0, limit = 10, sort = undefined } = params;
    // TODO: create a PR in nestjs-keyset-paginator to add document types
    return new Paginator().paginate(
      this.ticketModel,
      skip,
      limit,
      params.start_key,
      sort?.field,
      sort?.order,
      params.filter,
      params.projection,
    );
  }

  async find(
    params: PaginateDto = {},
  ): Promise<{ results: Ticket[]; next: NextPaginationDto[] }> {
    const paginatedResult = await this.paginate(params);
    const results = paginatedResult.docs.map((ticket) =>
      ticket.toJSON<Ticket>(),
    );
    return { results, next: paginatedResult.next_key };
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket?.id) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket.toJSON<Ticket>();
  }

  /**
   * @description this method is used to update the status of a ticket internally only
   */
  async updateStatusById(
    id: string,
    status: Ticket["status"],
  ): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket?.id) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    ticket.set({ status });
    await ticket.save();
    return ticket.toJSON<Ticket>();
  }

  async updateById(id: string, update: UpdateTicket): Promise<Ticket> {
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: id })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${id} not found`);
      } else if (ticket.orderId) {
        throw new BadRequestException(`Ticket ${id} is currently reserved`);
      }

      ticket.set(update);
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<
            TicketUpdatedEvent["name"],
            TicketUpdatedEvent["data"]
          >(Patterns.TicketUpdated, updatedTicket)
          .pipe(timeout(5000)),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async createOrder(event: OrderCreatedEvent["data"]): Promise<Ticket> {
    const ticketId = event.ticket.id;
    const orderId = event.id;
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId });
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<
            TicketUpdatedEvent["name"],
            TicketUpdatedEvent["data"]
          >(Patterns.TicketUpdated, updatedTicket)
          .pipe(timeout(5000)),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async cancelOrder(event: OrderCancelledEvent["data"]): Promise<Ticket> {
    const ticketId = event.ticket.id;
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId: undefined });
      await ticket.save({ session: manager.session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<
            TicketUpdatedEvent["name"],
            TicketUpdatedEvent["data"]
          >(Patterns.TicketUpdated, updatedTicket)
          .pipe(timeout(5000)),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }
}
```

</details>

#### 3.4.3. Update ticket.created consumer in **orders** micro-service

In `apps/orders/src/app/tickets/tickets-ms.controller.ts` replace `ticket.created` event listener by `ticket.approved`

```diff
+   @MessagePattern(Patterns.TicketApproved, Transport.RMQ)
-   @MessagePattern(Patterns.TicketCreated, Transport.RMQ)

+   data: EventsMap[Patterns.TicketApproved],
-   data: EventsMap[Patterns.TicketCreated],

```

<!-- endregion -->

# Establish the moderation process

This is the second part of the Moderation service implementation and we will implement the moderation process by creating a two-step automated moderation and a manual reviewing process

1. [Represent the domains](./2a-implement-moderation-service.md)

2. Establish the moderation process

   - [Protect routes](#1-protect-routes)
   - [Create an automated moderation process](#2-create-an-automated-moderation-process)
   - [Create a manual moderation process](#3-create-a-manual-moderation-process)
   - [Time for some action](#4-time-for-some-action)

3. [Refine moderation process](./2c-implement-moderation-service.md)

## 1. Protect routes

<!-- region nestjs-workshop-phase-2b-chapter-1 -->

To ensure that only authenticated admin users can access the moderation routes, we will use custom guards to check authentication and authorization.
We will use the `@ticketing/microservices/ory-client` library to interact with the [Ory Kratos](https://www.ory.sh/kratos/) and [Ory Keto](https://www.ory.sh/keto/) services (or Ory Network if you would prefer using the cloud version).

### 1.1. Update the `EnvironmentVariables` class

Update the class to support Ory configurations.

- Ory Kratos is used to authenticate the users
- Ory Keto is used to manage the permissions
- Ory Hydra is used to manage the OAuth2 flow (not used in this exercise)

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/env/index.ts
import { ConfigService } from "@nestjs/config";
import {
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
} from "@ticketing/microservices/shared/env";
import { Exclude } from "class-transformer";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Mixin } from "ts-mixer";

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "..", "..", "..", "..", "package.json");

class OryEnvironmentVariables extends Mixin(
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
) {}

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
  OryEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, "utf8"));

  APP_NAME?: string = "moderation";

  APP_VERSION?: string = this.pkg?.version || "0.0.1";
}
```

</details>

### 1.2. Update `.env` file

Update the environment variables:

<details>
<summary>Solution</summary>

```sh
# apps/moderation/.env
MONGODB_URI=mongodb://localhost:27017/moderation
NODE_ENV=development
ORY_HYDRA_ADMIN_URL=http://localhost:4434
ORY_HYDRA_PUBLIC_URL=http://localhost:4433
ORY_KETO_ADMIN_URL=http://localhost:4467
ORY_KETO_PUBLIC_URL=http://localhost:4466
ORY_KRATOS_ADMIN_URL=http://localhost:4434
ORY_KRATOS_PUBLIC_URL=http://localhost:4433
PORT=3090
REDIS_URL=redis://localhost:6379
RMQ_URL=amqp://localhost:5672
RMQ_MANAGEMENT_API_URL=http://localhost:15672
SERVER_URL=http://localhost:3090
```

</details>

### 1.3. Import Ory modules

Register the Ory modules:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.module.ts
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from "@getlarge/keto-client-wrapper";
import { OryFrontendModule } from "@getlarge/kratos-client-wrapper";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import type { RedisOptions } from "ioredis";
import { URL } from "node:url";

import { AppConfigService } from "../env";
import { QueueNames } from "../shared/queues";
import { TicketSchema } from "../tickets/schemas";
import { ModerationsController } from "./moderations.controller";
import { ModerationsProcessor } from "./moderations.processor";
import { ModerationsService } from "./moderations.service";
import { ModerationSchema } from "./schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KRATOS_PUBLIC_URL"),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KETO_PUBLIC_URL"),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        accessToken: configService.get("ORY_KETO_API_KEY"),
        basePath: configService.get("ORY_KETO_ADMIN_URL"),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService],
})
export class ModerationsModule {}
```

</details>

### 1.4. Check user authentication

Use the `OryAuthenticationGuard` to protect the routes of the `ModerationController`.
This guard will validate the current session and add the authenticated `user` to the Fastify request object.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
// ...
@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @UseGuards(
    OryAuthenticationGuard({
      cookieResolver: (ctx) =>
        ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
      isValidSession: (x) => {
        return (
          !!x?.identity &&
          typeof x.identity.traits === "object" &&
          !!x.identity.traits &&
          "email" in x.identity.traits &&
          typeof x.identity.metadata_public === "object" &&
          !!x.identity.metadata_public &&
          "id" in x.identity.metadata_public &&
          typeof x.identity.metadata_public.id === "string"
        );
      },
      sessionTokenResolver: (ctx) =>
        ctx
          .switchToHttp()
          .getRequest<FastifyRequest>()
          .headers?.authorization?.replace("Bearer ", ""),
      postValidationHook: (ctx, session) => {
        ctx.switchToHttp().getRequest().session = session;
        ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
          id: session.identity.metadata_public["id"],
          email: session.identity.traits.email,
          identityId: session.identity.id,
        };
      },
    }),
  )
  @Get()
  find(@Query() params: FilterModerationsDto): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }
  // ...
}
```

</details>

### 1.5. Update Ory permissions

Update the Ory Keto policies to reflect the [Permissions diagram](./1-design-moderation-service.md##Permissions).
The relation between the `Moderation` namespace and the `Group` namespace is **editors**, and the relation between the `Group` namespace and the `User` namespace is **members**. This means that when a `User` joins the **admin** `Group` and the **admin** `Group` is added to the **editors** relations (when creating a `Moderation` instance), this `User` can edit the `Moderation` instance.

<details>
<summary>Solution</summary>

```ts
// tools/ory/namespaces.ts
import type {
  Namespace,
  Context,
  SubjectSet,
} from "@ory/permission-namespace-types";

class User implements Namespace {}

class Group implements Namespace {
  related: {
    members: User[];
  };
}

class Moderation implements Namespace {
  related: {
    editors: SubjectSet<Group, "members">[];
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
```

</details>

### 1.6. Add permission checks in ModerationsController

Add mapping between `Resources` and `PermissionNamespaces` in `PermissionNamespaces`:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/models/src/permissions.ts
import { Resources } from "@ticketing/shared/constants";

export type PermissionObjects = {
  currentUserId: string | "Unauthorized";
  resourceId?: string;
};

export const PermissionNamespaces = {
  [Resources.GROUPS]: "Group",
  [Resources.MODERATIONS]: "Moderation",
  [Resources.ORDERS]: "Order",
  [Resources.PAYMENTS]: "Payment",
  [Resources.TICKETS]: "Ticket",
  [Resources.USERS]: "User",
};

export type PermissionNamespaces = typeof PermissionNamespaces;
```

</details>

Once more, update the `ModerationsController` to include `OryAuthorizationGuard` to check the permissions of the user before allowing him to edit or view a moderation.
This guard will ensure that a relation exists between the user (via admin Group members) and the moderation object.

> **Notes**:
> Check how to understand the syntax of relation tuples [here](https://www.ory.sh/docs/keto/concepts/relation-tuples).

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from "@getlarge/keto-client-wrapper";
import { relationTupleBuilder } from "@getlarge/keto-relations-parser";
import { OryAuthenticationGuard } from "@getlarge/kratos-client-wrapper";
import {
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Query,
  Type,
  UseGuards,
} from "@nestjs/common";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { ParseObjectId } from "@ticketing/microservices/shared/pipes";
import { CURRENT_USER_KEY, Resources } from "@ticketing/shared/constants";
import type { FastifyRequest } from "fastify";

import { FilterModerationsDto, ModerationDto } from "./models";
import { ModerationsService } from "./moderations.service";

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("members")
    .of(PermissionNamespaces[Resources.GROUPS], "admin")
    .toString();
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  const moderationId = (req.params as { id: string }).id;
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("editors")
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId)
    .toString();
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === "object" &&
        !!x.identity.traits &&
        "email" in x.identity.traits &&
        typeof x.identity.metadata_public === "object" &&
        !!x.identity.metadata_public &&
        "id" in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === "string"
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace("Bearer ", ""),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public["id"],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
  });

const AuthorizationGuard = (): Type<CanActivate> => OryAuthorizationGuard({});

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get()
  find(@Query() params: FilterModerationsDto): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(":id")
  findById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }
}
```

</details>

### 1.7. Create relations in ModerationsService

Update the `ModerationsService` to create the relations between the `Moderation` namespace and the `Group` namespace when creating a new moderation instance.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.service.ts
import { OryRelationshipsService } from "@getlarge/keto-client-wrapper";
import {
  createRelationQuery,
  relationTupleBuilder,
} from "@getlarge/keto-relations-parser";
import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Resources } from "@ticketing/shared/constants";
import { Moderation, ModerationStatus } from "@ticketing/shared/models";
import { Queue } from "bullmq";
import { Model, Types } from "mongoose";

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";
import { FilterModerationsDto, UpdateModerationDto } from "./models";
import { Moderation as ModerationSchema, ModerationDocument } from "./schemas";

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    @InjectModel(ModerationSchema.name)
    private moderationModel: Model<ModerationDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel
        .findOne({
          "ticket.$id": event.ticket.id,
        })
        .session(session);
      if (existingModeration) {
        // TODO: check whether moderation is pending,
        throw new Error(
          `Ticket moderation already exists - ${existingModeration.id}`,
        );
      }
      const res = await this.moderationModel.create(
        [
          {
            ticket: Types.ObjectId.createFromHexString(event.ticket.id),
            status: ModerationStatus.Pending,
          },
        ],
        { session },
      );
      await res[0].populate("ticket");
      const moderation = res[0].toJSON<Moderation>();
      this.logger.debug(`Created moderation ${moderation.id}`);

      const relationTupleWithAdminGroup = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.GROUPS], "admin", "members")
        .isIn("editors")
        .of(PermissionNamespaces[Resources.MODERATIONS], moderation.id)
        .toJSON();
      const createRelationshipBody = createRelationQuery(
        relationTupleWithAdminGroup,
      ).unwrapOrThrow();
      await this.oryRelationshipsService.createRelationship({
        createRelationshipBody,
      });
      this.logger.debug(
        `Created relation ${relationTupleWithAdminGroup.toString()}`,
      );

      const job = await this.moderationProcessor.add(
        "moderate-ticket",
        { ticket: event.ticket, ctx: event.ctx, moderation },
        {
          attempts: 2,
          delay: 1000,
          jobId: moderation.id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.debug(`Created job ${job.id}`);
      return moderation;
    });
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketApproved(event: TicketApprovedEvent): Promise<void> {
    this.logger.log(`onTicketApproved ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Approved,
    });
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketRejected(event: TicketRejectedEvent): Promise<void> {
    this.logger.log(`onTicketRejected ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Rejected,
    });
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  async findById(id: string): Promise<Moderation> {
    const moderation = await this.moderationModel
      .findOne({
        _id: id,
      })
      .populate("ticket");

    if (!moderation) {
      throw new NotFoundException(`Moderation not found - ${id}`);
    }
    return moderation.toJSON<Moderation>();
  }

  async updateById(
    id: string,
    update: UpdateModerationDto,
  ): Promise<Moderation> {
    const existingModeration = await this.moderationModel.findOne({
      _id: id,
    });
    existingModeration.set(update);
    const moderation = await existingModeration.save();
    await moderation.populate("ticket");
    return moderation.toJSON<Moderation>();
  }
}
```

</details>

<!-- endregion -->

## 2. Create an automated moderation process

<!-- region nestjs-workshop-phase-2b-chapter-2 -->

We will adopt three methods to moderate a ticket, as decided during the [Moderation design phase](./1-design-moderation-service.md). Two of them will be automated, and the last one will be manual.

### 2.1. Guard against inappropriate ticket titles

We will create a `ContentGuardModule` in `apps/moderation/src/app/content-guard/content-guard.module.ts` that will be responsible for the automated moderation of tickets. It will provide the following features:

- Match ticket title against a list of forbidden words and expressions
- Categorize the ticket title with [OpenAI Moderation API](https://platform.openai.com/docs/guides/moderation/quickstart)

The `ContentGuardModule` options will allow us to pass:

- A custom `dictionary` or use a default one from a [well-known source](https://github.com/chucknorris-io/swear-words/tree/master) at module initialization
- An `openAIApiKey` property to use the OpenAI API

First, we will modify the `EnvironmentVariables` class to add the OpenAI API key via `OPENAI_API_KEY`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/env/index.ts
import { ConfigService } from "@nestjs/config";
import {
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
} from "@ticketing/microservices/shared/env";
import { Exclude, Expose } from "class-transformer";
import { IsString } from "class-validator";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Mixin } from "ts-mixer";

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "..", "..", "..", "..", "package.json");

class OryEnvironmentVariables extends Mixin(
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
) {}

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
  OryEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, "utf8"));

  APP_NAME?: string = "moderation";

  APP_VERSION?: string = this.pkg?.version || "0.0.1";

  @Expose()
  @IsString()
  OPENAI_API_KEY: string;
}
```

</details>

> **Note**:
>
> - You will need to create an account on [OpenAI](https://platform.openai.com/) and create an API key to use the Moderation API.
> - You can then add the `OPENAI_API_KEY` in the `.env` file of the `moderation` application.
> - You need a provisioned card to make requests to the Moderation API.

Then, let's define interfaces for the module options:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/content-guard/content-guard.interfaces.ts
import type {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
  Type,
} from "@nestjs/common/interfaces";

export interface IContentGuardModuleOptions {
  openAIApiKey: string;
  dictionary?: { [language: string]: string[] };
}

export interface ContentGuardModuleOptionsFactory {
  createOryOptions():
    | Promise<IContentGuardModuleOptions>
    | IContentGuardModuleOptions;
}

export interface ContentGuardModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<ContentGuardModuleOptionsFactory>;
  useClass?: Type<ContentGuardModuleOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IContentGuardModuleOptions> | IContentGuardModuleOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export class ContentGuardModuleOptions implements IContentGuardModuleOptions {
  constructor(
    public readonly openAIApiKey: string,
    public dictionary?: { [language: string]: string[] },
  ) {}
}
```

</details>

Then, let's create the `ContentGuardModule` that will import the `HttpModule` and provide the `ContentGuardModuleOptions` and the `ContentGuardService`

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/content-guard/content-guard.module.ts
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module, Provider, Type } from "@nestjs/common";

import {
  ContentGuardModuleAsyncOptions,
  ContentGuardModuleOptions,
  ContentGuardModuleOptionsFactory,
  IContentGuardModuleOptions,
} from "./content-guard.interfaces";
import { ContentGuardService } from "./content-guard.service";

@Module({})
export class ContentGuardModule {
  static forRoot(
    options: IContentGuardModuleOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: ContentGuardModule,
      imports: [HttpModule],
      providers: [
        { provide: ContentGuardModuleOptions, useValue: options },
        ContentGuardService,
      ],
      exports: [ContentGuardModuleOptions, ContentGuardService],
      global: isGlobal,
    };
  }

  static forRootAsync(
    options: ContentGuardModuleAsyncOptions,
    isGlobal?: boolean,
  ): DynamicModule {
    return {
      module: ContentGuardModule,
      imports: options.imports
        ? [...options.imports, HttpModule]
        : [HttpModule],
      providers: [...this.createAsyncProviders(options), ContentGuardService],
      exports: [ContentGuardModuleOptions, ContentGuardService],
      global: isGlobal,
    };
  }

  private static createAsyncProviders(
    options: ContentGuardModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    if (options.useClass) {
      return [
        this.createAsyncOptionsProvider(options),
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
      ];
    }
    throw new Error("Invalid ContentGuardModuleAsyncOptions");
  }

  private static createAsyncOptionsProvider(
    options: ContentGuardModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: ContentGuardModuleOptions,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      };
    }
    if (!options.useExisting && !options.useClass) {
      throw new Error("Invalid OryAuthenticationModuleAsyncOptions");
    }
    return {
      provide: ContentGuardModuleOptions,
      useFactory: (optionsFactory: ContentGuardModuleOptionsFactory) =>
        optionsFactory.createOryOptions(),
      inject: [
        (options.useExisting ??
          options.useClass) as Type<ContentGuardModuleOptionsFactory>,
      ],
    };
  }
}
```

</details>

Finally, we will define the `ContentGuardService` that will provide methods for the automated moderation process:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/content-guard/content-guard.service.ts
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { firstValueFrom, map } from "rxjs";

import { ContentGuardModuleOptions } from "./content-guard.interfaces";

export interface IOpenAIModerationResponse {
  id: `modr-${string}`;
  model: `text-moderation-${string}`;
  results: {
    flagged: boolean;
    categories: {
      sexual: boolean;
      hate: boolean;
      harassment: boolean;
      "self-harm": boolean;
      "sexual/minors": boolean;
      "hate/threatening": boolean;
      "violence/graphic": boolean;
      "self-harm/intent": boolean;
      "self-harm/instructions": boolean;
      "harassment/threatening": boolean;
      violence: boolean;
    };
    category_scores: {
      sexual: number;
      hate: number;
      harassment: number;
      "self-harm": number;
      "sexual/minors": number;
      "hate/threatening": number;
      "violence/graphic": number;
      "self-harm/intent": number;
      "self-harm/instructions": number;
      "harassment/threatening": number;
      violence: number;
    };
  }[];
}

@Injectable()
export class ContentGuardService implements OnModuleInit {
  constructor(
    @Inject(ContentGuardModuleOptions)
    private readonly options: ContentGuardModuleOptions,
    private readonly httpService: HttpService,
  ) {}

  private get openAIApiKey(): string {
    return this.options.openAIApiKey;
  }

  private get dictionary(): ContentGuardModuleOptions["dictionary"] {
    return this.options.dictionary;
  }

  private set dictionary(dictionary: ContentGuardModuleOptions["dictionary"]) {
    this.options.dictionary = dictionary;
  }

  async onModuleInit(): Promise<void> {
    if (!this.dictionary) {
      // TODO: cache this to avoid hitting the API every time
      this.dictionary = {};
      this.dictionary.en = await firstValueFrom(
        this.httpService
          .get<string>(
            "https://raw.githubusercontent.com/chucknorris-io/swear-words/master/en",
          )
          .pipe(map((response) => response.data.trim().split("\n"))),
      );
    }
  }

  matchesDictionary(input: string, language: string = "en"): boolean {
    return (
      this.dictionary[language].filter((word) => {
        const wordExp = new RegExp(
          `\\b${word.replace(/(\W)/g, "\\$1")}\\b`,
          "gi",
        );
        return wordExp.test(input);
      }).length > 0 || false
    );
  }

  isFlagged(
    input: string,
    model:
      | "text-moderation-stable"
      | "text-moderation-latest" = "text-moderation-stable",
  ): Promise<IOpenAIModerationResponse["results"][0]> {
    return firstValueFrom(
      this.httpService
        .post<IOpenAIModerationResponse>(
          "https://api.openai.com/v1/moderations",
          {
            input,
            model,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.openAIApiKey}`,
            },
          },
        )
        .pipe(map((response) => response.data.results[0])),
    );
  }
}
```

</details>

### 2.2. Integrate ContentGuardModule in ModerationsModule

Import the `ContentGuardModule` and add it to the `imports` array:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.module.ts
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from "@getlarge/keto-client-wrapper";
import { OryFrontendModule } from "@getlarge/kratos-client-wrapper";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import type { RedisOptions } from "ioredis";
import { URL } from "node:url";

import { AppConfigService } from "../env";
import { QueueNames } from "../shared/queues";
import { TicketSchema } from "../tickets/schemas";
import { ModerationsController } from "./moderations.controller";
import { ModerationsProcessor } from "./moderations.processor";
import { ModerationsService } from "./moderations.service";
import { ModerationSchema } from "./schemas";
import { ContentGuardModule } from "../content-guard/content-guard.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KRATOS_PUBLIC_URL"),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KETO_PUBLIC_URL"),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        accessToken: configService.get("ORY_KETO_API_KEY"),
        basePath: configService.get("ORY_KETO_ADMIN_URL"),
      }),
    }),
    ContentGuardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        openAIApiKey: configService.get("OPENAI_API_KEY"),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService],
})
export class ModerationsModule {}
```

</details>

Inject the `ContentGuardService` via the constructor of the `ModerationsProcessor` and use it to moderate the ticket titles:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AsyncLocalStorageService } from "@ticketing/microservices/shared/async-local-storage";
import { ModerationStatus, TicketStatus } from "@ticketing/shared/models";
import type { Job } from "bullmq";

import { ContentGuardService } from "../content-guard/content-guard.service";
import {
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";

@Processor(QueueNames.MODERATE_TICKET)
export class ModerationsProcessor extends WorkerHost {
  readonly logger = new Logger(ModerationsProcessor.name);

  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(AsyncLocalStorageService)
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
    @Inject(ContentGuardService)
    private readonly contentGuardService: ContentGuardService,
  ) {
    super();
  }

  private async emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, event);
  }

  async process(
    job: Job<ModerateTicket>,
  ): Promise<{ status: ModerationStatus }> {
    const { ctx, ticket, moderation } = job.data;
    this.asyncLocalStorageService.enter();
    this.asyncLocalStorageService.set("REQUEST_CONTEXT", ctx);
    const { status } = await this.moderateTicket(job.data);
    switch (status) {
      case ModerationStatus.Approved:
        await this.emitEventAsync(TICKET_APPROVED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Approved },
          ticket: { ...ticket, status: TicketStatus.Approved },
        });
        break;
      case ModerationStatus.Rejected:
        await this.emitEventAsync(TICKET_REJECTED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Rejected },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      // TODO: create another status for moderation requiring human intervention
      case ModerationStatus.Pending:
        // TODO: notify moderation team
        break;
      default:
        break;
    }
    return { status };
  }

  private async moderateTicket(
    jobData: ModerateTicket,
  ): Promise<{ status: ModerationStatus; rejectionReason?: string }> {
    const { ticket } = jobData;
    const isMatched = this.contentGuardService.matchesDictionary(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        isMatched ? "matched" : "not matched"
      } with dictionary`,
    );
    if (isMatched) {
      const rejectionReason = `Ticket title contains inappropriate language`;
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    const result = await this.contentGuardService.isFlagged(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        result.flagged ? "flagged" : "not flagged"
      } by OpenAI`,
    );
    if (result.flagged) {
      const flaggedCategories = Object.entries(result.categories)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);
      const rejectionReason = `Ticket title contains inappropriate language in categories: ${flaggedCategories.join(
        ", ",
      )}`;
      this.logger.debug(rejectionReason);
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    return Promise.resolve({ status: ModerationStatus.Approved });
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<ModerateTicket>): void {
    this.logger.log(`Job: ${QueueNames.MODERATE_TICKET}-${job.id} completed`);
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("error")
  onError(error: Error): void {
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET} errored : ${error.message}`,
    );
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<ModerateTicket>, error: Error): void {
    const { failedReason } = job;
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET}-${job.id} failed : ${failedReason}`,
    );
    this.asyncLocalStorageService.exit();
  }
}
```

</details>

<!-- endregion -->

## 3. Create a manual moderation process

<!-- region nestjs-workshop-phase-2b-chapter-3 -->

We should now handle cases where the ticket title is hard to classify and thus requires manual moderation.

1. Define cases where the ticket title requires manual verification in ModerationsProcessor
2. Update the ModerationsController to allow manual moderation

### 3.1. Assign categories thresholds

We will define a threshold for each category to determine whether a ticket title moderation should be manual; if the score for a category is above (when flagged) or below (when not flagged) the threshold, the ticket title will be flagged for manual moderation.
For example, if a ticket's title is flagged for the `sexual` category with a score of `0.6` and the threshold for the `sexual` category is `0.7`, the ticket will be moved to manual moderation.

For the sake of simplicity, we will use environment variables to define the thresholds.

We will create the following environment variables:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/env/moderation-environment-variables.ts
import { applyDecorators } from "@nestjs/common";
import { Expose, Type } from "class-transformer";
import { IsNumber, IsString, Max, Min } from "class-validator";
import { decorate } from "ts-mixer";

export const IsThresholdDecorator = (): PropertyDecorator => {
  return applyDecorators(
    Expose(),
    Type(() => Number),
    IsNumber(),
    Min(0),
    Max(1),
  );
};

export class ModerationEnvironmentVariables {
  @decorate(Expose())
  @decorate(IsString())
  OPENAI_API_KEY: string;

  @decorate(IsThresholdDecorator())
  MODERATION_HATE_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HATE_THREATENING_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HARASSMENT_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HARASSMENT_THREATENING_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_INTENT_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_INSTRUCTIONS_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SEXUAL_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SEXUAL_MINORS_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_VIOLENCE_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_VIOLENCE_GRAPHIC_THRESHOLD?: number = 0.7;
}
```

</details>

Then, we will update the `EnvironmentVariables` class to extend the `ModerationEnvironmentVariables` class:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/env/index.ts
import { ConfigService } from "@nestjs/config";
import {
  BaseEnvironmentVariables,
  MongoEnvironmentVariables,
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
} from "@ticketing/microservices/shared/env";
import { Exclude } from "class-transformer";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Mixin } from "ts-mixer";

import { ModerationEnvironmentVariables } from "./moderation-environment-variables";

export type AppConfigService = ConfigService<EnvironmentVariables, true>;

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, "..", "..", "..", "..", "..", "package.json");

class OryEnvironmentVariables extends Mixin(
  OryHydraEnvironmentVariables,
  OryKetoEnvironmentVariables,
  OryKratosEnvironmentVariables,
) {}

export class EnvironmentVariables extends Mixin(
  BaseEnvironmentVariables,
  ModerationEnvironmentVariables,
  MongoEnvironmentVariables,
  RedisEnvironmentVariables,
  RmqEnvironmentVariables,
  OryEnvironmentVariables,
) {
  @Exclude()
  private pkg: { [key: string]: unknown; name?: string; version?: string } =
    JSON.parse(readFileSync(pkgPath, "utf8"));

  APP_NAME?: string = "moderation";

  APP_VERSION?: string = this.pkg?.version || "0.0.1";
}
```

</details>

Update `ModerationStatus` enum to add a new member `RequiresManualReview`:

<details>
<summary>Solution</summary>

```diff
// libs/shared/models/src/moderation.ts
export enum ModerationStatus {
+ RequiresManualReview = 'requires_manual_review',
}
```

</details>

Update Internal events to add a new event `MANUAL_REVIEW_REQUIRED`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/shared/events.ts
import { Resources } from "@ticketing/shared/constants";
import {
  Moderation,
  ModerationStatus,
  ModerationTicket,
  TicketStatus,
} from "@ticketing/shared/models";

export const enum EventStatus {
  CREATED = "created",
  APPROVED = "approved",
  REJECTED = "rejected",
  MANUAL_REVIEW_REQUIRED = "manual_review_required",
}

export type EventName = `${string}/${EventStatus}/*`;

export const TICKET_CREATED_EVENT = `${Resources.TICKETS}/${EventStatus.CREATED}/*`;
export const TICKET_APPROVED_EVENT = `${Resources.TICKETS}/${EventStatus.APPROVED}/*`;
export const TICKET_REJECTED_EVENT = `${Resources.TICKETS}/${EventStatus.REJECTED}/*`;
export const TICKET_MANUAL_REVIEW_REQUIRED_EVENT = `${Resources.TICKETS}/${EventStatus.MANUAL_REVIEW_REQUIRED}/*`;

export type TicketEvent = { ticket: ModerationTicket };
export type TicketCreatedEvent = TicketEvent & {
  ctx?: Record<string, unknown>;
};
export type TicketApprovedEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, "status"> & { status: TicketStatus.Approved };
  moderation: Omit<Moderation, "status"> & {
    status: ModerationStatus.Approved;
  };
  ctx?: Record<string, unknown>;
};
export type TicketRejectedEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, "status"> & { status: TicketStatus.Rejected };
  moderation: Omit<Moderation, "status"> & {
    status: ModerationStatus.Rejected;
  };
  ctx?: Record<string, unknown>;
};
export type TicketManualReviewRequiredEvent = TicketEvent & {
  ticket: Omit<ModerationTicket, "status"> & {
    status: TicketStatus.WaitingModeration;
  };
  moderation: Omit<Moderation, "status"> & {
    status: ModerationStatus.RequiresManualReview;
  };
  ctx?: Record<string, unknown>;
};
export type EventsMap = {
  [TICKET_CREATED_EVENT]: TicketCreatedEvent;
  [TICKET_APPROVED_EVENT]: TicketApprovedEvent;
  [TICKET_REJECTED_EVENT]: TicketRejectedEvent;
  [TICKET_MANUAL_REVIEW_REQUIRED_EVENT]: TicketManualReviewRequiredEvent;
};
```

</details>

We will update the `ModerationsProcessor` to compare category scores with the thresholds and determine whether an administrator should moderate the ticket title manually:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AsyncLocalStorageService } from "@ticketing/microservices/shared/async-local-storage";
import { ModerationStatus, TicketStatus } from "@ticketing/shared/models";
import type { Job } from "bullmq";

import {
  ContentGuardService,
  IOpenAIModerationResponse,
} from "../content-guard/content-guard.service";
import type { AppConfigService } from "../env";
import {
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";

@Processor(QueueNames.MODERATE_TICKET)
export class ModerationsProcessor extends WorkerHost {
  readonly logger = new Logger(ModerationsProcessor.name);

  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(AsyncLocalStorageService)
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
    @Inject(ContentGuardService)
    private readonly contentGuardService: ContentGuardService,
    @Inject(ConfigService) private readonly configService: AppConfigService,
  ) {
    super();
  }

  private async emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, event);
  }

  async process(
    job: Job<ModerateTicket>,
  ): Promise<{ status: ModerationStatus }> {
    const { ctx, ticket, moderation } = job.data;
    this.asyncLocalStorageService.enter();
    this.asyncLocalStorageService.set("REQUEST_CONTEXT", ctx);
    const { status, rejectionReason } = await this.moderateTicket(job.data);
    switch (status) {
      case ModerationStatus.Approved:
        await this.emitEventAsync(TICKET_APPROVED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Approved },
          ticket: { ...ticket, status: TicketStatus.Approved },
        });
        break;
      case ModerationStatus.Rejected:
        await this.emitEventAsync(TICKET_REJECTED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.Rejected,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      case ModerationStatus.RequiresManualReview:
        //  TODO: notify moderation team
        await this.emitEventAsync(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.RequiresManualReview,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.WaitingModeration },
        });
        break;
      default:
        break;
    }
    return { status };
  }

  private get categoryThresholds(): IOpenAIModerationResponse["results"][0]["category_scores"] {
    return {
      hate: this.configService.get("MODERATION_HATE_THRESHOLD"),
      "hate/threatening": this.configService.get(
        "MODERATION_HATE_THREATENING_THRESHOLD",
      ),
      harassment: this.configService.get("MODERATION_HARASSMENT_THRESHOLD"),
      "harassment/threatening": this.configService.get(
        "MODERATION_HARASSMENT_THREATENING_THRESHOLD",
      ),
      "self-harm": this.configService.get("MODERATION_SELF_HARM_THRESHOLD"),
      "self-harm/intent": this.configService.get(
        "MODERATION_SELF_HARM_INTENT_THRESHOLD",
      ),
      "self-harm/instructions": this.configService.get(
        "MODERATION_SELF_HARM_INSTRUCTIONS_THRESHOLD",
      ),
      sexual: this.configService.get("MODERATION_SEXUAL_THRESHOLD"),
      "sexual/minors": this.configService.get(
        "MODERATION_SEXUAL_MINORS_THRESHOLD",
      ),
      violence: this.configService.get("MODERATION_VIOLENCE_THRESHOLD"),
      "violence/graphic": this.configService.get(
        "MODERATION_VIOLENCE_GRAPHIC_THRESHOLD",
      ),
    };
  }

  private async moderateTicket(
    jobData: ModerateTicket,
  ): Promise<{ status: ModerationStatus; rejectionReason?: string }> {
    const { ticket } = jobData;
    const isMatched = this.contentGuardService.matchesDictionary(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        isMatched ? "matched" : "not matched"
      } with dictionary`,
    );
    if (isMatched) {
      const rejectionReason = `Ticket title contains inappropriate language`;
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    const {
      flagged,
      categories,
      category_scores: scores,
    } = await this.contentGuardService.isFlagged(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        flagged ? "flagged" : "not flagged"
      } by OpenAI`,
    );
    if (flagged) {
      const thresholdConfig = this.categoryThresholds;
      const uncertainCategories = Object.entries(scores).filter(
        ([category, score]) => score < thresholdConfig[category],
      );
      if (uncertainCategories.length) {
        const rejectionReason = `Ticket title classification requires manual review : ${uncertainCategories
          .map(([category]) => category)
          .join(", ")}`;
        this.logger.debug(rejectionReason);
        return {
          status: ModerationStatus.RequiresManualReview,
          rejectionReason,
        };
      }

      const flaggedCategories = Object.entries(categories)
        .filter((category) => category[1])
        .map(([category]) => category);
      const rejectionReason = `Ticket title contains inappropriate language in categories: ${flaggedCategories.join(
        ", ",
      )}`;
      this.logger.debug(rejectionReason);
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    return Promise.resolve({ status: ModerationStatus.Approved });
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<ModerateTicket>): void {
    this.logger.log(`Job: ${QueueNames.MODERATE_TICKET}-${job.id} completed`);
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("error")
  onError(error: Error): void {
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET} errored : ${error.message}`,
    );
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<ModerateTicket>, error: Error): void {
    const { failedReason } = job;
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET}-${job.id} failed : ${failedReason}`,
    );
    this.asyncLocalStorageService.exit();
  }
}
```

</details>

### 3.2. Allow moderators to approve or reject tickets

We will now update the `ModerationsController` to allow moderators to approve or reject tickets reusing the `OryAuthorizationGuard` and `OryAuthenticationGuard` to check the user's permissions before allowing him to approve or reject a moderation.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from "@getlarge/keto-client-wrapper";
import { relationTupleBuilder } from "@getlarge/keto-relations-parser";
import { OryAuthenticationGuard } from "@getlarge/kratos-client-wrapper";
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Query,
  Type,
  UseGuards,
} from "@nestjs/common";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { ParseObjectId } from "@ticketing/microservices/shared/pipes";
import { CURRENT_USER_KEY, Resources } from "@ticketing/shared/constants";
import type { FastifyRequest } from "fastify";

import {
  FilterModerationsDto,
  ModerationDto,
  RejectModerationDto,
} from "./models";
import { ModerationsService } from "./moderations.service";

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("members")
    .of(PermissionNamespaces[Resources.GROUPS], "admin")
    .toString();
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  const moderationId = (req.params as { id: string }).id;
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("editors")
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId)
    .toString();
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === "object" &&
        !!x.identity.traits &&
        "email" in x.identity.traits &&
        typeof x.identity.metadata_public === "object" &&
        !!x.identity.metadata_public &&
        "id" in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === "string"
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace("Bearer ", ""),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public["id"],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
  });

const AuthorizationGuard = (): Type<CanActivate> => OryAuthorizationGuard({});

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get()
  find(@Query() params: FilterModerationsDto): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(":id")
  findById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/approve")
  approveById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/reject")
  rejectById(
    @Param("id", ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto = {},
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}
```

</details>

To make these new routes effective, we will implement the `approveById` and `rejectById` methods and handle the `MANUAL_REVIEW_REQUIRED` event in the `ModerationsService`.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.service.ts
import { OryRelationshipsService } from "@getlarge/keto-client-wrapper";
import {
  createRelationQuery,
  relationTupleBuilder,
} from "@getlarge/keto-relations-parser";
import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Resources } from "@ticketing/shared/constants";
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from "@ticketing/shared/models";
import { Queue } from "bullmq";
import { Model, Types } from "mongoose";

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketManualReviewRequiredEvent,
  type TicketRejectedEvent,
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";
import { FilterModerationsDto, UpdateModerationDto } from "./models";
import { Moderation as ModerationSchema, ModerationDocument } from "./schemas";

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    @InjectModel(ModerationSchema.name)
    private moderationModel: Model<ModerationDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
  ) {}

  private emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<unknown> {
    return this.eventEmitter.emitAsync(eventName, event);
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  async findById(id: string): Promise<Moderation> {
    const moderation = await this.moderationModel
      .findOne({
        _id: id,
      })
      .populate("ticket");

    if (!moderation) {
      throw new NotFoundException(`Moderation not found - ${id}`);
    }
    return moderation.toJSON<Moderation>();
  }

  async updateById(
    id: string,
    update: UpdateModerationDto,
  ): Promise<Moderation> {
    const existingModeration = await this.moderationModel.findOne({
      _id: id,
    });
    existingModeration.set(update);
    const moderation = await existingModeration.save();
    await moderation.populate("ticket");
    return moderation.toJSON<Moderation>();
  }

  async approveById(id: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_APPROVED_EVENT, {
      moderation: { ...moderation, status: ModerationStatus.Approved },
      ticket: { ...moderation.ticket, status: TicketStatus.Approved },
      ctx: {},
    });
    return { ...moderation, status: ModerationStatus.Approved };
  }

  async rejectById(id: string, rejectionReason: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_REJECTED_EVENT, {
      moderation: {
        ...moderation,
        status: ModerationStatus.Rejected,
        rejectionReason,
      },
      ticket: { ...moderation.ticket, status: TicketStatus.Rejected },
      ctx: {},
    });
    return {
      ...moderation,
      status: ModerationStatus.Rejected,
      rejectionReason,
    };
  }

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel
        .findOne({
          "ticket.$id": event.ticket.id,
        })
        .session(session);
      if (existingModeration) {
        // TODO: check whether moderation is pending,
        throw new Error(
          `Ticket moderation already exists - ${existingModeration.id}`,
        );
      }
      const res = await this.moderationModel.create(
        [
          {
            ticket: Types.ObjectId.createFromHexString(event.ticket.id),
            status: ModerationStatus.Pending,
          },
        ],
        { session },
      );
      await res[0].populate("ticket");
      const moderation = res[0].toJSON<Moderation>();
      this.logger.debug(`Created moderation ${moderation.id}`);

      const relationTupleWithAdminGroup = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.GROUPS], "admin", "members")
        .isIn("editors")
        .of(PermissionNamespaces[Resources.MODERATIONS], moderation.id);
      const createRelationshipBody = createRelationQuery(
        relationTupleWithAdminGroup.toJSON(),
      ).unwrapOrThrow();
      await this.oryRelationshipsService.createRelationship({
        createRelationshipBody,
      });
      this.logger.debug(
        `Created relation ${relationTupleWithAdminGroup.toString()}`,
      );

      const job = await this.moderationProcessor.add(
        "moderate-ticket",
        { ticket: event.ticket, ctx: event.ctx, moderation },
        {
          attempts: 2,
          delay: 1000,
          jobId: moderation.id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.debug(`Created job ${job.id}`);
      return moderation;
    });
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketApproved(event: TicketApprovedEvent): Promise<void> {
    this.logger.log(`onTicketApproved ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Approved,
    });
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketRejected(event: TicketRejectedEvent): Promise<void> {
    this.logger.log(`onTicketRejected ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Rejected,
    });
  }

  @OnEvent(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketManualReviewRequired(
    event: TicketManualReviewRequiredEvent,
  ): Promise<void> {
    this.logger.log(`onTicketManualReviewRequired ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.RequiresManualReview,
      rejectionReason: event.moderation.rejectionReason,
    });
  }
}
```

</details>

Then add upstream and `moderations` route in nginx configuration, in `infra/nginx/nginx.template` to allow our users to access the `moderations` service via our proxy:

<details>

```nginx
limit_req_zone $binary_remote_addr zone=one:2m rate=10r/s;
limit_req_log_level notice;
limit_req_status 429;
limit_req zone=one burst=20 nodelay;

client_body_timeout 10s;
client_header_timeout 10s;
client_max_body_size 10M;
client_header_buffer_size 4k;

upstream frontend {
  server $FRONTEND:$FRONTEND_PORT;
}

upstream auth_service {
  least_conn;
  server $AUTH_SERVICE:$AUTH_SERVICE_PORT;
}

upstream orders_service {
  least_conn;
  server $ORDERS_SERVICE:$ORDERS_SERVICE_PORT;
}

upstream payments_service {
  least_conn;
  server $PAYMENTS_SERVICE:$PAYMENTS_SERVICE_PORT;
}

upstream tickets_service {
  least_conn;
  server $TICKETS_SERVICE:$TICKETS_SERVICE_PORT;
}

upstream moderations_service {
  least_conn;
  server $MODERATIONS_SERVICE:$MODERATIONS_SERVICE_PORT;
}

# set default version header to 0
map $http_x_version $req_version {
  default $http_x_version;
  "" "0";
}

map $http_origin $use_cors {
    default "";
    "~(^|^http:\/\/)(localhost$|localhost:[0-9]{1,4}$)" 'true';
    "~(^|^http:\/\/)(127.0.0.1:[0-9]{1,4}$)" 'true';
    "(https?:\/\/)($DOMAIN)" 'true';
    "~*(https?:\/\/)(.+\.)*($DOMAIN)" 'true';
    "~*(^|^https?:\/\/)(.+\.)*(ticketing.(dev|ovh|com))" 'true';
    "~*(^|^https?:\/\/)(.+\.)*(getlarge.eu)" 'true';
}

map $use_cors $cors_cred {
  default '';
  'true' 'true';
}

map $use_cors $allow_origin {
  'true' $http_origin;
}

map $use_cors $allow_methods {
  'true' 'GET, POST, DELETE, PUT, PATCH, OPTIONS';
}

map $use_cors $allow_headers {
  'true' 'X-Version,X-Access-Token,X-Refresh-Token,Authorization,Cookie,Refresh,Set-Cookie,DNT,User-Agent,Keep-Alive,Content-Type,Pragma,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Accept,Range,Upgrade-Insecure-Requests';
}

map $use_cors $expose_headers {
  'true' '*';
}

server {
  listen 8080;
  listen [::]:8080 ipv6only=on;
  server_name _;

  real_ip_header X-Forwarded-For;
  add_header Access-Control-Allow-Origin $allow_origin always;
  add_header Access-Control-Allow-Credentials $cors_cred;
  add_header Access-Control-Allow-Methods $allow_methods;
  add_header Access-Control-Allow-Headers $allow_headers;
  add_header Access-Control-Expose-Headers $expose_headers;
  add_header Vary 'Origin';

  # localtunnel specific header
  add_header Bypass-Tunnel-Reminder "yo";

  if ($request_method = 'OPTIONS') {
    return 204 no-content;
  }

  location /api/users {
    proxy_pass http://auth_service;
    proxy_set_header X-Version $req_version;
    proxy_set_header Host $AUTH_SERVICE;
    include /etc/nginx/snippets/proxy.conf;
  }

  location /api/clients {
    proxy_pass http://auth_service;
    proxy_set_header X-Version $req_version;
    proxy_set_header Host $AUTH_SERVICE;
    include /etc/nginx/snippets/proxy.conf;
  }

  location /api/orders {
    proxy_pass http://orders_service;
    proxy_set_header X-Version $req_version;
    proxy_set_header Host $ORDERS_SERVICE;
    include /etc/nginx/snippets/proxy.conf;
  }

  location /api/payments {
    proxy_pass http://payments_service;
    proxy_set_header X-Version $req_version;
    proxy_set_header Host $PAYMENTS_SERVICE;
    include /etc/nginx/snippets/proxy.conf;
  }

  location /api/tickets {
    proxy_pass http://tickets_service;
    proxy_set_header X-Version $req_version;
    proxy_set_header Host $TICKETS_SERVICE;
    include /etc/nginx/snippets/proxy.conf;
  }

  location /api/moderations {
    proxy_pass http://moderations_service;
    proxy_set_header X-Version $req_version;
    proxy_set_header Host $MODERATIONS_SERVICE;
    include /etc/nginx/snippets/proxy.conf;
  }

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location /ws {
    proxy_pass http://frontend;
    include /etc/nginx/snippets/proxy.conf;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location /ng-cli-ws {
    proxy_pass http://frontend;
    include /etc/nginx/snippets/proxy.conf;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $FRONTEND;
    include /etc/nginx/snippets/proxy.conf;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy "no-referrer" always;
    add_header X-XSS-Protection "1; mode=block" always;
  }

  error_page 500 502 503 504 /50x.html;

  location = /50x.html {
    root /usr/share/nginx/html;
  }

}
```

</details>

Update environment variables in `.env` to add `MODERATIONS_SERVICE` and `MODERATIONS_SERVICE_PORT`:

<details>

```diff
# .env
# ...
AUTH_SERVICE=host.docker.internal
AUTH_SERVICE_PORT=3000
+ MODERATIONS_SERVICE=host.docker.internal
+ MODERATIONS_SERVICE_PORT=3090
# ...
```

</details>

<!-- endregion -->

## 4. Time for some action

<!-- region nestjs-workshop-phase-2b-chapter-4 -->

### 4.1. Start the applications

Check the following [instructions](../1-introduction-to-nestjs/2-app-config.md##4.-Test-setup).

### 4.2. Create a new user

```sh
npx @getlarge/kratos-cli register --email <user_email>
# the CLI should ask you for the password
```

In case of success, you should see a similar output:

```json
{
  "email": "<user_email>",
  "identityId": "<uuid>"
}
```

### 4.3. Verify the user's email

Use the link in the email sent to the user:

- check email in [MailSlurper UI](http://127.0.0.1:4436/#)
- open the latest email with the subject `Please verify your email address`
- click on the link

You can resend the verification email using the following command:

```sh
npx @getlarge/kratos-cli verify --email <user_email>
```

### 4.4. Test user login

```sh
npx @getlarge/kratos-cli login --email <user_email>
# the CLI should ask you for the password
```

Then copy the `token` (starting with **ory_st\***) and paste it in the `Authorization` header for the following request:

```sh
export ORY_SESSION_TOKEN=ory_st_**

curl  -X GET \
  'http://localhost:8080/api/users/current-user' \
  --header 'Accept: */*' \
  --header "Authorization: Bearer ${ORY_SESSION_TOKEN}"

# should return the user info
{"identityId":"<ory_user_id>","id":"<user_id>","email":"<user_email>"}
```

Finally, copy the `id` of the user for the next step.

### 4.5. Add the user to the admin group

```sh
export USER_ID=<user_id>
npx @getlarge/keto-cli create --tuple "Group:admin#members@User:$USER_ID"
```

### 4.6. Testing the moderation process

#### 4.6.1. Create a legitimate ticket

```sh
curl  -X POST \
  'http://localhost:8080/api/tickets' \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{ "title": "My legit ticket", "price": 20 }'

# should return the ticket info
{"id":"<ticket_id>","title":"My ticket title","price":20,"userId":"<user_id>","version":0,"createdAt":"2021-09-12T15:00:00.000Z","updatedAt":"2021-09-12T15:00:00.000Z"}
```

#### 4.6.2. Create a ticket with a forbidden word in the title

```sh
curl  -X POST \
  'http://localhost:8080/api/tickets' \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{ "title": "intercourse", "price": 55 }'
```

After a few seconds, the ticket should be rejected.

#### 4.6.3. Create a ticket with a title that contains violent speech

```sh
curl -X POST \
  'http://localhost:8080/api/tickets' \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{ "title": "bang your head on the table", "price": 55 }'
```

After a few seconds, the ticket should be rejected.

#### 4.6.4. Create a ticket with a title that contains content hard (self-harm) to classify

```sh
curl -X POST \
  'http://localhost:8080/api/tickets' \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{ "title": "lets hold hands and jump from the bridge!", "price": 25 }'
```

After a few seconds, the ticket should require manual review.
Let's fetch the moderations that require manual review:

```sh
curl -X GET \
  'http://localhost:8080/api/moderations?status=requires_manual_review' \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}"
```

#### 3.6.5. Approve a ticket

Pick one of the moderation IDs and approve it:

```sh
export MODERATION_ID=<moderation_id>
curl -X PATCH \
  "http://localhost:8080/api/moderations/${MODERATION_ID}/approve" \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}"
```

#### 3.6.6. Reject a ticket

Pick one of the moderation IDs and reject it:

```sh
export MODERATION_ID=<moderation_id>
curl -X PATCH \
  "http://localhost:8080/api/moderations/${MODERATION_ID}/reject" \
  -H 'Accept: */*' \
  -H "Authorization: Bearer ${ORY_SESSION_TOKEN}"
```

<!-- endregion -->

### TODO

- [ ] test the moderation with a non-admin user
- [ ] Only fetch tickets not pending except for the owner

# Refine moderation process

This is the third part of the Moderation service implementation and we will refine the moderation process by:

- validating request input
- caching moderation results
- periodically checking pending moderation
- handling and formatting errors after `ticket.created` event
- sending email notifications to moderators (optional)

1. [Represent the domains](./2a-implement-moderation-service.md)

2. [Establish the moderation process](./2b-implement-moderation-service.md)

3. Refine moderation process

- [Validate request inputs](#1-validate-request-inputs)
- [Cache moderation results](#2-cache-moderation-results)
- [Periodically check pending moderations](#3-periodically-check-pending-moderations)
- [Handle and format errors](#4-handle-and-format-errors)
- [Send email notifications to moderators](#5-send-email-notifications-to-moderators)

## 1. Validate request inputs

<!-- region nestjs-workshop-phase-2c-chapter-1 -->

Validate request input using DTOs and `ValidationPipe`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from "@getlarge/keto-client-wrapper";
import { relationTupleBuilder } from "@getlarge/keto-relations-parser";
import { OryAuthenticationGuard } from "@getlarge/kratos-client-wrapper";
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Query,
  Type,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from "@nestjs/common";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { ParseObjectId } from "@ticketing/microservices/shared/pipes";
import { CURRENT_USER_KEY, Resources } from "@ticketing/shared/constants";
import { requestValidationErrorFactory } from "@ticketing/shared/errors";
import type { FastifyRequest } from "fastify";

import {
  FilterModerationsDto,
  ModerationDto,
  RejectModerationDto,
} from "./models";
import { ModerationsService } from "./moderations.service";

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("members")
    .of(PermissionNamespaces[Resources.GROUPS], "admin")
    .toString();
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  const moderationId = (req.params as { id: string }).id;
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("editors")
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId)
    .toString();
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === "object" &&
        !!x.identity.traits &&
        "email" in x.identity.traits &&
        typeof x.identity.metadata_public === "object" &&
        !!x.identity.metadata_public &&
        "id" in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === "string"
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace("Bearer ", ""),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public["id"],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
  });

const AuthorizationGuard = (): Type<CanActivate> => OryAuthorizationGuard({});

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get()
  find(
    @Query(new ValidationPipe(validationPipeOptions))
    params: FilterModerationsDto,
  ): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(":id")
  findById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/approve")
  approveById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @UsePipes(new ValidationPipe(validationPipeOptions))
  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/reject")
  rejectById(
    @Param("id", ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto = {},
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}
```

</details>

<!-- endregion -->

## 2. Cache moderation results

<!-- region nestjs-workshop-phase-2c-chapter-2 -->

We will cache the `ModerationsController` response from GET endpoints to improve performance using the cache-aside strategy. To achieve this, we will use [CacheManager](https://docs.nestjs.com/techniques/caching#cache-manager) and [Interceptors](https://docs.nestjs.com/interceptors).

### 2.1. Install dependencies

First, install the required dependencies:

```sh
yarn add @nestjs/cache-manager cache-manager cache-manager-ioredis-yet
```

### 2.2. Register CacheModule

Configure the `CacheModule` with a Redis store:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.module.ts
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from "@getlarge/keto-client-wrapper";
import { OryFrontendModule } from "@getlarge/kratos-client-wrapper";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { redisStore } from "cache-manager-ioredis-yet";
import type { RedisOptions } from "ioredis";
import { URL } from "node:url";

import { ContentGuardModule } from "../content-guard/content-guard.module";
import { AppConfigService } from "../env";
import { QueueNames } from "../shared/queues";
import { TicketSchema } from "../tickets/schemas";
import { ModerationsController } from "./moderations.controller";
import { ModerationsProcessor } from "./moderations.processor";
import { ModerationsService } from "./moderations.service";
import { ModerationSchema } from "./schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        const store = await redisStore(redisOptions);
        return {
          store,
        };
      },
    }),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KRATOS_PUBLIC_URL"),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KETO_PUBLIC_URL"),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        accessToken: configService.get("ORY_KETO_API_KEY"),
        basePath: configService.get("ORY_KETO_ADMIN_URL"),
      }),
    }),
    ContentGuardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        openAIApiKey: configService.get("OPENAI_API_KEY"),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService],
})
export class ModerationsModule {}
```

</details>

### 2.3. Implement cache-aside strategy with Interceptors

One way to cache response is to implement the `CacheInterceptor`. The interceptor will automatically cache the response of the `find` method using the request URL as the key, and the TTL will be computed using the `CacheTTL` decorator.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from "@getlarge/keto-client-wrapper";
import { relationTupleBuilder } from "@getlarge/keto-relations-parser";
import { OryAuthenticationGuard } from "@getlarge/kratos-client-wrapper";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Query,
  Type,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from "@nestjs/common";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { ParseObjectId } from "@ticketing/microservices/shared/pipes";
import { CURRENT_USER_KEY, Resources } from "@ticketing/shared/constants";
import { requestValidationErrorFactory } from "@ticketing/shared/errors";
import { ModerationStatus } from "@ticketing/shared/models";
import type { FastifyRequest } from "fastify";

import {
  FilterModerationsDto,
  ModerationDto,
  RejectModerationDto,
} from "./models";
import { ModerationsService } from "./moderations.service";

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("members")
    .of(PermissionNamespaces[Resources.GROUPS], "admin")
    .toString();
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  const moderationId = (req.params as { id: string }).id;
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("editors")
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId)
    .toString();
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === "object" &&
        !!x.identity.traits &&
        "email" in x.identity.traits &&
        typeof x.identity.metadata_public === "object" &&
        !!x.identity.metadata_public &&
        "id" in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === "string"
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace("Bearer ", ""),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public["id"],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
  });

const AuthorizationGuard = (): Type<CanActivate> => OryAuthorizationGuard({});

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @UseInterceptors(CacheInterceptor)
  @CacheTTL((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const query = (req.query as FilterModerationsDto) ?? {};
    switch (query?.status) {
      case ModerationStatus.Approved:
      case ModerationStatus.Rejected:
        return 60;
      case ModerationStatus.Pending:
      case ModerationStatus.RequiresManualReview:
      default:
        return 5;
    }
  })
  @Get()
  find(
    @Query(new ValidationPipe(validationPipeOptions))
    params: FilterModerationsDto,
  ): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(":id")
  findById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/approve")
  approveById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @UsePipes(new ValidationPipe(validationPipeOptions))
  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/reject")
  rejectById(
    @Param("id", ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto = {},
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}
```

</details>

### 2.4. Implement cache-aside strategy with CacheManager instance

Another way is to use the `CacheManager` instance directly. In this case, we will use the `cacheManager.wrap` method to cache the response of the `findById` method using the moderation id as the key, and the TTL will be computed using the `cacheManager.wrap` result.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.service.ts
import { OryRelationshipsService } from "@getlarge/keto-client-wrapper";
import {
  createRelationQuery,
  relationTupleBuilder,
} from "@getlarge/keto-relations-parser";
import { InjectQueue } from "@nestjs/bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Resources } from "@ticketing/shared/constants";
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from "@ticketing/shared/models";
import { Queue } from "bullmq";
import type { Cache } from "cache-manager";
import { Model, Types } from "mongoose";

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketManualReviewRequiredEvent,
  type TicketRejectedEvent,
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";
import { FilterModerationsDto, UpdateModerationDto } from "./models";
import { Moderation as ModerationSchema, ModerationDocument } from "./schemas";

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    @InjectModel(ModerationSchema.name)
    private moderationModel: Model<ModerationDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<unknown> {
    return this.eventEmitter.emitAsync(eventName, event);
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  findById(id: string): Promise<Moderation> {
    return this.cacheManager.wrap(
      `moderation:${id}`,
      async () => {
        const moderation = await this.moderationModel
          .findOne({ _id: id })
          .populate("ticket");
        if (!moderation) {
          throw new NotFoundException(`Moderation not found - ${id}`);
        }
        return moderation.toJSON<Moderation>();
      },
      (moderation) => {
        switch (moderation?.status) {
          case ModerationStatus.Approved:
          case ModerationStatus.Rejected:
            return 60;
          case ModerationStatus.Pending:
          case ModerationStatus.RequiresManualReview:
          default:
            return 5;
        }
      },
    );
  }

  async updateById(
    id: string,
    update: UpdateModerationDto,
  ): Promise<Moderation> {
    const existingModeration = await this.moderationModel.findOne({
      _id: id,
    });
    existingModeration.set(update);
    const moderation = await existingModeration.save();
    await moderation.populate("ticket");
    return moderation.toJSON<Moderation>();
  }

  async approveById(id: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_APPROVED_EVENT, {
      moderation: { ...moderation, status: ModerationStatus.Approved },
      ticket: { ...moderation.ticket, status: TicketStatus.Approved },
      ctx: {},
    });
    return { ...moderation, status: ModerationStatus.Approved };
  }

  async rejectById(id: string, rejectionReason: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_REJECTED_EVENT, {
      moderation: {
        ...moderation,
        status: ModerationStatus.Rejected,
        rejectionReason,
      },
      ticket: { ...moderation.ticket, status: TicketStatus.Rejected },
      ctx: {},
    });
    return {
      ...moderation,
      status: ModerationStatus.Rejected,
      rejectionReason,
    };
  }

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel
        .findOne({
          "ticket.$id": event.ticket.id,
        })
        .session(session);
      if (existingModeration) {
        // TODO: check whether moderation is pending,
        throw new Error(
          `Ticket moderation already exists - ${existingModeration.id}`,
        );
      }
      const res = await this.moderationModel.create(
        [
          {
            ticket: Types.ObjectId.createFromHexString(event.ticket.id),
            status: ModerationStatus.Pending,
          },
        ],
        { session },
      );
      await res[0].populate("ticket");
      const moderation = res[0].toJSON<Moderation>();
      this.logger.debug(`Created moderation ${moderation.id}`);

      const relationTupleWithAdminGroup = relationTupleBuilder()
        .subject(PermissionNamespaces[Resources.GROUPS], "admin", "members")
        .isIn("editors")
        .of(PermissionNamespaces[Resources.MODERATIONS], moderation.id);
      const createRelationshipBody = createRelationQuery(
        relationTupleWithAdminGroup.toJSON(),
      ).unwrapOrThrow();
      await this.oryRelationshipsService.createRelationship({
        createRelationshipBody,
      });
      this.logger.debug(
        `Created relation ${relationTupleWithAdminGroup.toString()}`,
      );

      const job = await this.moderationProcessor.add(
        "moderate-ticket",
        { ticket: event.ticket, ctx: event.ctx, moderation },
        {
          attempts: 2,
          delay: 1000,
          jobId: moderation.id,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
      this.logger.debug(`Created job ${job.id}`);
      return moderation;
    });
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketApproved(event: TicketApprovedEvent): Promise<void> {
    this.logger.log(`onTicketApproved ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Approved,
    });
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketRejected(event: TicketRejectedEvent): Promise<void> {
    this.logger.log(`onTicketRejected ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Rejected,
    });
  }

  @OnEvent(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketManualReviewRequired(
    event: TicketManualReviewRequiredEvent,
  ): Promise<void> {
    this.logger.log(`onTicketManualReviewRequired ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.RequiresManualReview,
      rejectionReason: event.moderation.rejectionReason,
    });
  }
}
```

</details>

<!-- endregion -->

## 3. Periodically check pending moderations

<!-- region nestjs-workshop-phase-2c-chapter-3 -->

We want to ensure a ticket moderation is not left pending in the `moderation` micro-service, which could happen if the micro-service is down or the moderation job is lost or expired.

To achieve this, we will use [Schedulers](https://docs.nestjs.com/techniques/task-scheduling) to periodically check pending moderations and [LockService](https://github.com/getlarge/nestjs-tools/tree/main/packages/lock) to ensure only one instance of the moderation micro-service checks pending moderations.

### 3.1. Install dependencies

First, install the required dependencies:

```sh
yarn add @nestjs/schedule @getlarge/nestjs-tools-lock
```

> **Note**:
>
> - The `@nestjs/schedule` package provides a set of scheduling tools for NestJS applications.
> - The `@getlarge/nestjs-tools-lock` package provides a distributed lock service (using Redis) for NestJS applications.

### 3.2. Register SchedulersModule

Configure the `ScheduleModule` and `LockModule` in the `ModerationsModule`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.module.ts
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from "@getlarge/keto-client-wrapper";
import { OryFrontendModule } from "@getlarge/kratos-client-wrapper";
import { LockModule } from "@getlarge/nestjs-tools-lock";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { redisStore } from "cache-manager-ioredis-yet";
import type { RedisOptions } from "ioredis";
import { URL } from "node:url";

import { ContentGuardModule } from "../content-guard/content-guard.module";
import { AppConfigService } from "../env";
import { QueueNames } from "../shared/queues";
import { TicketSchema } from "../tickets/schemas";
import { ModerationsController } from "./moderations.controller";
import { ModerationsProcessor } from "./moderations.processor";
import { ModerationsService } from "./moderations.service";
import { ModerationsTasks } from "./moderations.tasks";
import { ModerationSchema } from "./schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        const store = await redisStore(redisOptions);
        return {
          store,
        };
      },
    }),
    LockModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          redis: redisOptions,
          lock: {
            retryCount: 0,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KRATOS_PUBLIC_URL"),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KETO_PUBLIC_URL"),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        accessToken: configService.get("ORY_KETO_API_KEY"),
        basePath: configService.get("ORY_KETO_ADMIN_URL"),
      }),
    }),
    ContentGuardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        openAIApiKey: configService.get("OPENAI_API_KEY"),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService, ModerationsTasks],
})
export class ModerationsModule {}
```

</details>

### 3.3. Implement Schedulers

Let's now create the `ModerationsTasks` provider to periodically check pending moderations:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.tasks.ts
import { LockService } from "@getlarge/nestjs-tools-lock";
import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SchedulerRegistry, Timeout } from "@nestjs/schedule";
import type { Queue } from "bullmq";
import type { Model } from "mongoose";
import { type Lock, ExecutionError, ResourceLockedError } from "redlock";

import { ModerateTicket, QueueNames } from "../shared/queues";
import { Moderation, ModerationDocument } from "./schemas";

@Injectable()
export class ModerationsTasks {
  readonly logger = new Logger(ModerationsTasks.name);

  constructor(
    @Inject(LockService) private readonly lockService: LockService,
    @Inject(SchedulerRegistry) private schedulerRegistry: SchedulerRegistry,
    @InjectModel(Moderation.name)
    private moderationModel: Model<ModerationDocument>,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
  ) {}

  @Timeout("checkPendingModerations", 5000)
  async checkPendingModerations(): Promise<void> {
    const taskKey = "checkPendingModerations";
    this.logger.verbose(`creating lock for ${taskKey}`);
    let lock: Lock = await this.lockService
      .lock(taskKey, 2000)
      .catch(async (err) => {
        // improve error handling as suggested in https://github.com/mike-marcacci/node-redlock/issues/288
        let isAlreadyLocked = err instanceof ResourceLockedError;
        if (err instanceof ExecutionError && err.attempts.length) {
          const attemptError = (await err.attempts.at(0)).votesAgainst
            .values()
            .next().value;
          isAlreadyLocked = attemptError instanceof ResourceLockedError;
        }
        if (!isAlreadyLocked) {
          throw err;
        }
        return null;
      });
    // if the lock is not released, we don't want to continue
    if (typeof lock?.release !== "function") {
      return;
    }
    this.logger.debug("checking pending moderations...");

    try {
      const pendingModerations = await this.moderationModel
        .find({
          status: "pending",
          // only check moderations that are more than 10 seconds old
          $where: function () {
            return new Date(Date.now() - 10000) > this._id.getTimestamp();
          },
        })
        .populate("ticket");

      this.logger.debug(
        `Found ${pendingModerations.length} pending moderations.`,
      );
      if (pendingModerations.length > 0) {
        lock = await lock.extend(5000);
      }
      for (const pendingModeration of pendingModerations) {
        const moderation = pendingModeration.toJSON<Moderation>();
        await this.moderationProcessor
          .getJob(moderation.id)
          .then(async (job) => {
            if (job) {
              const state = await job.getState();
              this.logger.debug(`Job ${moderation.id} is ${state}`);
              return job;
            }
            return this.moderationProcessor.add(
              "moderate-ticket",
              {
                ticket: pendingModeration.ticket.toJSON(),
                ctx: {},
                moderation,
              },
              {
                attempts: 1,
                delay: 1000,
                jobId: moderation.id,
                removeOnComplete: true,
                removeOnFail: true,
              },
            );
          });
      }
    } finally {
      const timeout = this.schedulerRegistry.getTimeout(
        taskKey,
      ) as NodeJS.Timeout;
      timeout.refresh();
      await lock.release();
    }
  }
}
```

> **Note**:
>
> - The `checkPendingModerations` method is scheduled to run once after 5 seconds. It will check for pending moderations that are more than 10 seconds old and re-queue the moderation job if it is not already in the queue.
> - The `lockService` is used to ensure only one instance of the moderation micro-service checks pending moderations at a time.
> - Oonce the task is completed, the `SchedulerRegistry` is used to refresh the timeout of the `checkPendingModerations` method and the lock is released.

</details>

<!-- endregion -->

## 4. Handle and format errors

<!-- region nestjs-workshop-phase-2c-chapter-4 -->

The error handling in `Moderations` and `Tickets` modules (in `moderation` micro-service) is a simple foundation. We will improve it by:

- using [ExceptionFilters](https://docs.nestjs.com/exception-filters) to handle and format errors (as `ErrorResponse`) in controllers
- conditionally NACK and re-queue messages when the consumer (controller) should retry the message processing
- implement message retry strategy with RxJS when the producer (client) detect a retriable error

### 4.1. Identify errors

Let's start by anticipating the type of errors our services could encounter during the moderation process (after `ticket>created` event):

1. Network error (AMQP connection error, server down or overloaded, etc.)
2. Rate limit error (too many requests)
3. Request validation error (invalid request input)
4. MongoDB connection error in moderation micro-service
5. MongoDB validation error in moderation micro-service
6. Fail to create permission in Ory keto
7. Redis error (connection error, out of memory, etc.) in moderation micro-service

Now, we can classify those errors into four categories:

1. Retriable (1, 2)
2. Recoverable (4, 7)
3. Acceptable (3, 5, 6)
4. Unknown (any other errors)

With that in mind, we can create a set of custom errors to represent those categories.

Create `GenericError`:

<details>
<summary>Solution</summary>

```ts
// libs/shared/errors/src/generic-error.ts
import { CustomError } from "./custom-error";
import { ErrorResponse } from "./error-response";

export abstract class GenericError extends CustomError {
  abstract readonly name: string;

  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly path: string = "",
    public readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    Object.setPrototypeOf(this, GenericError.prototype);
  }

  getDetails(): Record<string, unknown> {
    return this.details;
  }

  serializeErrors(): { message: string }[] {
    return [{ message: this.message }];
  }

  toErrorResponse(): ErrorResponse {
    return new ErrorResponse({
      name: this.name,
      statusCode: this.statusCode,
      errors: this.serializeErrors(),
      details: this.getDetails(),
      path: this.path,
    });
  }
}

export function isGenericError(error: unknown): error is GenericError {
  return error instanceof GenericError;
}
```

</details>

Create `RetriableError`:

<details>

```ts
// libs/shared/errors/src/retriable-error.ts
import { GenericError } from "./generic-error";

/**
 * @description Retriable errors are errors that can be resolved by retrying the request on the producer side.
 * @example
 * - A request to a service that is currently unavailable.
 * - A request to a service that is currently overloaded.
 * - A request that is being throttled.
 * - A request that is being rate limited.
 * - A request that is being blocked by a firewall.
 */
export class RetriableError extends GenericError {
  public readonly name = "RetriableError";

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, RetriableError.prototype);
  }
}

export function isRetriableError(error: unknown): error is RetriableError {
  return error instanceof RetriableError;
}
```

</details>

Create `RecoverableError`:

<details>
<summary>Solution</summary>

```ts
// libs/shared/errors/src/recoverable-error.ts
import { GenericError } from "./generic-error";

/**
 * @description Recoverable errors are errors that can be resolved by requeuing the message on the consumer side.
 * @example
 * - A request to an internal service that is currently unavailable.
 * - A request to an internal service that is currently overloaded.
 * - A request that is being throttled.
 *
 */
export class RecoverableError extends GenericError {
  public readonly name = "RecoverableError";

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, RecoverableError.prototype);
  }
}

export function isRecoverableError(error: unknown): error is RecoverableError {
  return error instanceof RecoverableError;
}
```

</details>

Create `AcceptableError`:

<details>
<summary>Solution</summary>

```ts
// libs/shared/errors/src/acceptable-error.ts
import { GenericError } from "./generic-error";

/**
 * Acceptable errors are errors that protects the system from unexpected / undesired entries, and that cannot be resolved by retrying or requeuing the message.
 * @example
 * - A request with invalid credentials.
 * - A request with invalid data.
 * - A request with invalid parameters.
 * - A request with dangerous data.
 */
export class AcceptableError extends GenericError {
  public readonly name = "AcceptableError";

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, AcceptableError.prototype);
  }
}

export function isAcceptableError(error: unknown): error is AcceptableError {
  return error instanceof AcceptableError;
}
```

</details>

Create `UnidentifiedError`:

<details>
<summary>Solution</summary>

```ts
// libs/shared/errors/src/unidentified-error.ts
import { GenericError } from "./generic-error";

/**
 * Unidentified errors are errors that we have not anticipate. A smart way to handle those errors is to log them, send them to a dead letter queue and drop the message.
 */
export class UnidentifiedError extends GenericError {
  public readonly name = "UnidentifiedError";

  constructor(
    message: string,
    statusCode: number,
    path: string,
    details: Record<string, unknown> = {},
  ) {
    super(message, statusCode, path, details);
    Object.setPrototypeOf(this, UnidentifiedError.prototype);
  }
}

export function isUnidentifiedError(
  error: unknown,
): error is UnidentifiedError {
  return error instanceof UnidentifiedError;
}
```

</details>

Finally, export all classes in `libs/shared/errors/src/index.ts`:

### 4.2. ExceptionFilters

Now that we have our custom errors, we can implement an `ExceptionFilter`.
This filter will catch all errors from HTTP endpoints and RPC consumers and format them as `ErrorResponse` using the `GenericError.toErrorResponse` serializer.

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/filters/exception.filter.ts
import { OryError } from "@getlarge/kratos-client-wrapper";
import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";
import { ErrorResponse, GenericError } from "@ticketing/shared/errors";
import type { AxiosError } from "axios";
import type { FastifyReply, FastifyRequest } from "fastify";
import { Observable, throwError } from "rxjs";

@Catch()
export class GenericExceptionFilter<T = unknown> implements ExceptionFilter<T> {
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ): FastifyReply | Observable<ErrorResponse> {
    const type = host.getType();
    if (type === "http") {
      return this.handleHttpException(exception, host);
    } else if (type === "rpc") {
      return this.handleRpcException(exception, host);
    }
    throw exception;
  }

  private handleHttpException(
    exception: unknown,
    host: ArgumentsHost,
  ): FastifyReply {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();
    const status = this.getStatus(exception);
    const errorResponse = this.getErrorResponse(exception, request.url);
    return response.status(status).send(errorResponse);
  }

  private handleRpcException(
    exception: unknown,
    host: ArgumentsHost,
  ): Observable<ErrorResponse> {
    const ctx = host.switchToRpc().getContext<RmqContext>();
    const pattern = ctx.getPattern();
    const errorResponse = this.getErrorResponse(exception, pattern);
    return throwError(() => errorResponse);
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof GenericError || exception instanceof OryError) {
      return exception.statusCode;
    }
    if (exception["isAxiosError"]) {
      return (exception as AxiosError).response?.status || 500;
    }
    if (exception instanceof Error) {
      return 500;
    }
    return 500;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof GenericError || exception instanceof OryError) {
      return exception.message;
    }
    if (exception["isAxiosError"]) {
      return (
        (exception as AxiosError)?.cause?.message ??
        (exception as AxiosError).message
      );
    }
    if (exception instanceof Error) {
      return exception.message;
    }
    return "Unknown error";
  }

  private getErrorResponse(exception: unknown, path?: string): ErrorResponse {
    if (exception instanceof GenericError) {
      return exception.toErrorResponse();
    }
    return new ErrorResponse({
      name: "UnknownError",
      statusCode: this.getStatus(exception),
      errors: [{ message: this.getMessage(exception) }],
      details: {},
      path,
    });
  }
}
```

</details>

This `GenericExceptionFilter` can now be applied to the `TicketsMSController` :

<details>

```diff
// ...
+ import { GenericExceptionFilter } from '../../filters/exception.filter';

@Controller()
+ @UseFilters(GenericExceptionFilter)
export class TicketsMSController {
```

</details>

And it can also be applied to the `ModerationsController`:

<details>

```ts
// apps/moderation/src/app/moderations/moderations.controller.ts
import {
  OryAuthorizationGuard,
  OryPermissionChecks,
} from "@getlarge/keto-client-wrapper";
import { relationTupleBuilder } from "@getlarge/keto-relations-parser";
import { OryAuthenticationGuard } from "@getlarge/kratos-client-wrapper";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Param,
  Patch,
  Query,
  Type,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from "@nestjs/common";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { ParseObjectId } from "@ticketing/microservices/shared/pipes";
import { CURRENT_USER_KEY, Resources } from "@ticketing/shared/constants";
import {
  AcceptableError,
  requestValidationErrorFactory,
} from "@ticketing/shared/errors";
import { ModerationStatus } from "@ticketing/shared/models";
import type { FastifyRequest } from "fastify";

import { GenericExceptionFilter } from "../filters/exception.filter";
import {
  FilterModerationsDto,
  ModerationDto,
  RejectModerationDto,
} from "./models";
import { ModerationsService } from "./moderations.service";

const adminPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("members")
    .of(PermissionNamespaces[Resources.GROUPS], "admin")
    .toString();
};

const moderationPermission = (ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<FastifyRequest>();
  const currentUserId = req[`${CURRENT_USER_KEY}`]["id"];
  const moderationId = (req.params as { id: string }).id;
  return relationTupleBuilder()
    .subject(PermissionNamespaces[Resources.USERS], currentUserId)
    .isIn("editors")
    .of(PermissionNamespaces[Resources.MODERATIONS], moderationId)
    .toString();
};

const AuthenticationGuard = (): Type<CanActivate> =>
  OryAuthenticationGuard({
    cookieResolver: (ctx) =>
      ctx.switchToHttp().getRequest<FastifyRequest>().headers.cookie,
    isValidSession: (x) => {
      return (
        !!x?.identity &&
        typeof x.identity.traits === "object" &&
        !!x.identity.traits &&
        "email" in x.identity.traits &&
        typeof x.identity.metadata_public === "object" &&
        !!x.identity.metadata_public &&
        "id" in x.identity.metadata_public &&
        typeof x.identity.metadata_public.id === "string"
      );
    },
    sessionTokenResolver: (ctx) =>
      ctx
        .switchToHttp()
        .getRequest<FastifyRequest>()
        .headers?.authorization?.replace("Bearer ", ""),
    postValidationHook: (ctx, session) => {
      ctx.switchToHttp().getRequest().session = session;
      ctx.switchToHttp().getRequest()[CURRENT_USER_KEY] = {
        id: session.identity.metadata_public["id"],
        email: session.identity.traits.email,
        identityId: session.identity.id,
      };
    },
    unauthorizedFactory(ctx) {
      return new AcceptableError(
        "Unauthorized",
        401,
        ctx.switchToHttp().getRequest().url,
      );
    },
  });

const AuthorizationGuard = (): Type<CanActivate> =>
  OryAuthorizationGuard({
    unauthorizedFactory(ctx) {
      return new AcceptableError(
        "Forbidden",
        403,
        ctx.switchToHttp().getRequest().url,
      );
    },
  });

const validationPipeOptions: ValidationPipeOptions = {
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  exceptionFactory: requestValidationErrorFactory,
  forbidUnknownValues: true,
  whitelist: true,
};

@UseFilters(GenericExceptionFilter)
@Controller(Resources.MODERATIONS)
export class ModerationsController {
  constructor(private readonly moderationService: ModerationsService) {}

  @OryPermissionChecks(adminPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @UseInterceptors(CacheInterceptor)
  @CacheTTL((ctx) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const query = (req.query as FilterModerationsDto) ?? {};
    switch (query?.status) {
      case ModerationStatus.Approved:
      case ModerationStatus.Rejected:
        return 60;
      case ModerationStatus.Pending:
      case ModerationStatus.RequiresManualReview:
      default:
        return 5;
    }
  })
  @Get()
  find(
    @Query(new ValidationPipe(validationPipeOptions))
    params: FilterModerationsDto,
  ): Promise<ModerationDto[]> {
    return this.moderationService.find(params);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Get(":id")
  findById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.findById(id);
  }

  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/approve")
  approveById(@Param("id", ParseObjectId) id: string): Promise<ModerationDto> {
    return this.moderationService.approveById(id);
  }

  @UsePipes(new ValidationPipe(validationPipeOptions))
  @OryPermissionChecks(moderationPermission)
  @UseGuards(AuthenticationGuard(), AuthorizationGuard())
  @Patch(":id/reject")
  rejectById(
    @Param("id", ParseObjectId) id: string,
    @Body() { rejectionReason }: RejectModerationDto = {},
  ): Promise<ModerationDto> {
    return this.moderationService.rejectById(id, rejectionReason);
  }
}
```

> **Note**:
> `unauthorizedFactory` should be implemented in `OryAuthenticationGuard` and `OryAuthorizationGuard` to return an `AcceptableError` when the user is not authenticated or authorized.

</details>

### 4.3. Retriable errors

Retriable errors can be resolved by retrying the request on the producer side; here, the **tickets** micro-service when it publishes the `ticket.created` event. We will add a retry strategy to our `ClientProxy` using `rxjs` operators to accomplish this.

<details>
<summary>Solution</summary>

```ts
// apps/tickets/src/app/tickets/tickets.service.ts
import { OryRelationshipsService } from "@getlarge/keto-client-wrapper";
import {
  createRelationQuery,
  relationTupleBuilder,
} from "@getlarge/keto-relations-parser";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { Relationship } from "@ory/client";
import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  Patterns,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@ticketing/microservices/shared/events";
import {
  NextPaginationDto,
  PaginateDto,
  PermissionNamespaces,
} from "@ticketing/microservices/shared/models";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Resources } from "@ticketing/shared/constants";
import { isErrorResponse, RetriableError } from "@ticketing/shared/errors";
import { User } from "@ticketing/shared/models";
import { Model } from "mongoose";
import { Paginator } from "nestjs-keyset-paginator";
import {
  catchError,
  lastValueFrom,
  retry,
  throwError,
  timeout,
  timer,
} from "rxjs";

import { MODERATIONS_CLIENT, ORDERS_CLIENT } from "../shared/constants";
import { CreateTicket, Ticket, UpdateTicket } from "./models";
import { Ticket as TicketSchema, TicketDocument } from "./schemas";

@Injectable()
export class TicketsService {
  readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name)
    private readonly ticketModel: Model<TicketDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @Inject(ORDERS_CLIENT) private readonly ordersClient: ClientProxy,
    @Inject(MODERATIONS_CLIENT) private readonly moderationClient: ClientProxy,
  ) {}

  async create(ticket: CreateTicket, currentUser: User): Promise<Ticket> {
    let createdRelation: Relationship | undefined;
    try {
      await using manager = await transactionManager(this.ticketModel);
      const res = await manager.wrap<Ticket>(async (session) => {
        const doc: CreateTicket & { userId: string } = {
          ...ticket,
          userId: currentUser.id,
        };
        const docs = await this.ticketModel.create([doc], {
          session,
        });
        const newTicket = docs[0].toJSON<Ticket>();
        this.logger.debug(`Created ticket ${newTicket.id}`);

        const relationTuple = relationTupleBuilder()
          .subject(PermissionNamespaces[Resources.USERS], currentUser.id)
          .isIn("owners")
          .of(PermissionNamespaces[Resources.TICKETS], newTicket.id);
        const createRelationshipBody = createRelationQuery(
          relationTuple.toJSON(),
        ).unwrapOrThrow();
        const { data } = await this.oryRelationshipsService.createRelationship({
          createRelationshipBody,
        });
        createdRelation = data;
        this.logger.debug(`Created relation ${relationTuple.toString()}`);

        await lastValueFrom(
          this.moderationClient
            .send<
              TicketCreatedEvent["name"],
              TicketCreatedEvent["data"]
            >(Patterns.TicketCreated, newTicket)
            .pipe(
              retry({
                count: 5,
                delay: (error: Error, retryCount: number) => {
                  const scalingDuration = 500;
                  if (
                    isErrorResponse(error) &&
                    error.name === RetriableError.name
                  ) {
                    this.logger.debug(`retry attempt #${retryCount}`);
                    return timer(retryCount * scalingDuration);
                  }
                  throw error;
                },
              }),
              timeout(8000),
              catchError((err) => {
                this.logger.error(err);
                return throwError(() => err);
              }),
            ),
        );
        this.logger.debug(`Sent event ${Patterns.TicketCreated}`);
        return newTicket;
      });

      if (res.error) {
        throw res.error;
      }
      return res.value;
    } catch (error) {
      if (createdRelation) {
        await this.oryRelationshipsService.deleteRelationships(createdRelation);
      }
      throw error;
    }
  }

  paginate(params: PaginateDto = {}): Promise<{
    docs: TicketDocument[];
    next_key: { key: string; value: string }[];
  }> {
    const { skip = 0, limit = 10, sort = undefined } = params;
    // TODO: create a PR in nestjs-keyset-paginator to add document types
    return new Paginator().paginate(
      this.ticketModel,
      skip,
      limit,
      params.start_key,
      sort?.field,
      sort?.order,
      params.filter,
      params.projection,
    );
  }

  async find(
    params: PaginateDto = {},
  ): Promise<{ results: Ticket[]; next: NextPaginationDto[] }> {
    const paginatedResult = await this.paginate(params);
    const results = paginatedResult.docs.map((ticket) =>
      ticket.toJSON<Ticket>(),
    );
    return { results, next: paginatedResult.next_key };
  }

  async findById(id: string): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket?.id) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    return ticket.toJSON<Ticket>();
  }

  /**
   * @description this method is used to update the status of a ticket internally only
   */
  async updateStatusById(
    id: string,
    status: Ticket["status"],
  ): Promise<Ticket> {
    const ticket = await this.ticketModel.findOne({ _id: id });
    if (!ticket?.id) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }
    ticket.set({ status });
    await ticket.save();
    return ticket.toJSON<Ticket>();
  }

  async updateById(id: string, update: UpdateTicket): Promise<Ticket> {
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: id })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${id} not found`);
      } else if (ticket.orderId) {
        throw new BadRequestException(`Ticket ${id} is currently reserved`);
      }

      ticket.set(update);
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<
            TicketUpdatedEvent["name"],
            TicketUpdatedEvent["data"]
          >(Patterns.TicketUpdated, updatedTicket)
          .pipe(timeout(5000)),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async createOrder(event: OrderCreatedEvent["data"]): Promise<Ticket> {
    const ticketId = event.ticket.id;
    const orderId = event.id;
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId });
      await ticket.save({ session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<
            TicketUpdatedEvent["name"],
            TicketUpdatedEvent["data"]
          >(Patterns.TicketUpdated, updatedTicket)
          .pipe(timeout(5000)),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }

  async cancelOrder(event: OrderCancelledEvent["data"]): Promise<Ticket> {
    const ticketId = event.ticket.id;
    await using manager = await transactionManager(this.ticketModel);
    const result = await manager.wrap(async (session) => {
      const ticket = await this.ticketModel
        .findOne({ _id: ticketId })
        .session(session);
      if (ticket?.id) {
        throw new NotFoundException(`Ticket ${ticketId} not found`);
      }
      ticket.set({ orderId: undefined });
      await ticket.save({ session: manager.session });
      const updatedTicket = ticket.toJSON<Ticket>();
      await lastValueFrom(
        this.ordersClient
          .send<
            TicketUpdatedEvent["name"],
            TicketUpdatedEvent["data"]
          >(Patterns.TicketUpdated, updatedTicket)
          .pipe(timeout(5000)),
      );
      return updatedTicket;
    });
    if (result.error) {
      this.logger.error(result.error);
      throw result.error;
    }
    return result.value;
  }
}
```

</details>

### 4.4. Recoverable errors

Recoverable errors can (potentially) be resolved by re-queuing the message on the consumer side.
We will change the arguments passed to `channel.nack` (in `catch` block) to implement this solution:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/tickets/tickets-ms.controller.ts
import {
  Controller,
  Inject,
  Logger,
  UseFilters,
  ValidationPipe,
} from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
  Transport,
} from "@nestjs/microservices";
import { ApiExcludeEndpoint } from "@nestjs/swagger";
import { EventsMap, Patterns } from "@ticketing/microservices/shared/events";
import {
  isRecoverableError,
  requestValidationErrorFactory,
} from "@ticketing/shared/errors";
import type { Channel } from "amqp-connection-manager";
import type { Message } from "amqplib";

import { GenericExceptionFilter } from "../filters/exception.filter";
import { TicketsService } from "./tickets.service";

@UseFilters(GenericExceptionFilter)
@Controller()
export class TicketsMSController {
  readonly logger = new Logger(TicketsMSController.name);

  constructor(
    @Inject(TicketsService) private readonly ticketsService: TicketsService,
  ) {}

  @ApiExcludeEndpoint()
  @MessagePattern(Patterns.TicketCreated, Transport.RMQ)
  async onCreated(
    @Payload(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: requestValidationErrorFactory,
        forbidUnknownValues: true,
        whitelist: true,
      }),
    )
    data: EventsMap[Patterns.TicketCreated],
    @Ctx() context: RmqContext,
  ): Promise<{ ok: boolean }> {
    const channel = context.getChannelRef() as Channel;
    const message = context.getMessage() as Message;
    const pattern = context.getPattern();
    this.logger.debug(`received message on ${pattern}`, {
      data,
    });
    try {
      await this.ticketsService.create(data);
      channel.ack(message);
      return { ok: true };
    } catch (e) {
      if (isRecoverableError(e)) {
        channel.nack(message, false, true);
      } else {
        channel.nack(message, false, false);
      }
      throw e;
    }
  }
}
```

</details>

Now, let's handle the Recoverable and Acceptable errors during the moderation process in the `ModerationsService`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.service.ts
import { OryRelationshipsService } from "@getlarge/keto-client-wrapper";
import {
  createRelationQuery,
  relationTupleBuilder,
} from "@getlarge/keto-relations-parser";
import { OryError } from "@getlarge/kratos-client-wrapper";
import { InjectQueue } from "@nestjs/bullmq";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { PermissionNamespaces } from "@ticketing/microservices/shared/models";
import { transactionManager } from "@ticketing/microservices/shared/mongo";
import { Resources } from "@ticketing/shared/constants";
import {
  AcceptableError,
  GenericError,
  RecoverableError,
  UnidentifiedError,
} from "@ticketing/shared/errors";
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from "@ticketing/shared/models";
import { Queue } from "bullmq";
import type { Cache } from "cache-manager";
import { MongoNetworkError, MongoServerClosedError } from "mongodb";
import { Model, Types } from "mongoose";

import {
  type TicketApprovedEvent,
  type TicketCreatedEvent,
  type TicketManualReviewRequiredEvent,
  type TicketRejectedEvent,
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";
import { FilterModerationsDto, UpdateModerationDto } from "./models";
import { Moderation as ModerationSchema, ModerationDocument } from "./schemas";

@Injectable()
export class ModerationsService {
  private readonly logger = new Logger(ModerationsService.name);

  constructor(
    @InjectModel(ModerationSchema.name)
    private moderationModel: Model<ModerationDocument>,
    @Inject(OryRelationshipsService)
    private readonly oryRelationshipsService: OryRelationshipsService,
    @InjectQueue(QueueNames.MODERATE_TICKET)
    private readonly moderationProcessor: Queue<ModerateTicket>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<unknown> {
    return this.eventEmitter.emitAsync(eventName, event);
  }

  async find(params: FilterModerationsDto = {}): Promise<Moderation[]> {
    const moderations = await this.moderationModel.find({
      ...(params?.status && { status: params.status }),
    });
    return moderations.map((moderation) => moderation.toJSON<Moderation>());
  }

  findById(id: string): Promise<Moderation> {
    return this.cacheManager.wrap(
      `moderation:${id}`,
      async () => {
        const moderation = await this.moderationModel
          .findOne({ _id: id })
          .populate("ticket");
        if (!moderation) {
          throw new NotFoundException(`Moderation not found - ${id}`);
        }
        return moderation.toJSON<Moderation>();
      },
      (moderation) => {
        switch (moderation?.status) {
          case ModerationStatus.Approved:
          case ModerationStatus.Rejected:
            return 60;
          case ModerationStatus.Pending:
          case ModerationStatus.RequiresManualReview:
          default:
            return 5;
        }
      },
    );
  }

  async updateById(
    id: string,
    update: UpdateModerationDto,
  ): Promise<Moderation> {
    const existingModeration = await this.moderationModel.findOne({
      _id: id,
    });
    existingModeration.set(update);
    const moderation = await existingModeration.save();
    await moderation.populate("ticket");
    return moderation.toJSON<Moderation>();
  }

  async approveById(id: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_APPROVED_EVENT, {
      moderation: { ...moderation, status: ModerationStatus.Approved },
      ticket: { ...moderation.ticket, status: TicketStatus.Approved },
      ctx: {},
    });
    return { ...moderation, status: ModerationStatus.Approved };
  }

  async rejectById(id: string, rejectionReason: string): Promise<Moderation> {
    const moderation = await this.findById(id);
    await this.emitEventAsync(TICKET_REJECTED_EVENT, {
      moderation: {
        ...moderation,
        status: ModerationStatus.Rejected,
        rejectionReason,
      },
      ticket: { ...moderation.ticket, status: TicketStatus.Rejected },
      ctx: {},
    });
    return {
      ...moderation,
      status: ModerationStatus.Rejected,
      rejectionReason,
    };
  }

  @OnEvent(TICKET_CREATED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketCreated(event: TicketCreatedEvent): Promise<void> {
    this.logger.log(`onTicketCreated ${JSON.stringify(event)}`);
    await using manager = await transactionManager(this.moderationModel);
    await manager.wrap(async (session) => {
      const existingModeration = await this.moderationModel
        .findOne({
          "ticket.$id": event.ticket.id,
        })
        .session(session);
      if (existingModeration) {
        // TODO: check whether moderation is pending,
        throw new AcceptableError(
          `Ticket moderation already exists - ${existingModeration.id}`,
          HttpStatus.BAD_REQUEST,
          TICKET_CREATED_EVENT,
        );
      }
      try {
        const res = await this.moderationModel.create(
          [
            {
              ticket: Types.ObjectId.createFromHexString(event.ticket.id),
              status: ModerationStatus.Pending,
            },
          ],
          { session },
        );
        await res[0].populate("ticket");
        const moderation = res[0].toJSON<Moderation>();
        this.logger.debug(`Created moderation ${moderation.id}`);

        const relationTupleWithAdminGroup = relationTupleBuilder()
          .subject(PermissionNamespaces[Resources.GROUPS], "admin", "members")
          .isIn("editors")
          .of(PermissionNamespaces[Resources.MODERATIONS], moderation.id);
        const createRelationshipBody = createRelationQuery(
          relationTupleWithAdminGroup.toJSON(),
        ).unwrapOrThrow();
        await this.oryRelationshipsService.createRelationship({
          createRelationshipBody,
        });
        this.logger.debug(
          `Created relation ${relationTupleWithAdminGroup.toString()}`,
        );

        const job = await this.moderationProcessor.add(
          "moderate-ticket",
          { ticket: event.ticket, ctx: event.ctx, moderation },
          {
            attempts: 2,
            delay: 1000,
            jobId: moderation.id,
            removeOnComplete: true,
            removeOnFail: true,
          },
        );
        this.logger.debug(`Created job ${job.id}`);
        return moderation;
      } catch (e) {
        if (e instanceof GenericError) {
          throw e;
        }
        if (
          e instanceof MongoNetworkError ||
          e instanceof MongoServerClosedError
        ) {
          throw new RecoverableError(
            e.message,
            HttpStatus.SERVICE_UNAVAILABLE,
            TICKET_CREATED_EVENT,
          );
        }
        if (e instanceof OryError) {
          this.logger.error(e.getDetails());
          throw new AcceptableError(
            `Could not create relation`,
            HttpStatus.BAD_REQUEST,
            TICKET_CREATED_EVENT,
          );
        }
        throw new UnidentifiedError(
          e.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
          TICKET_CREATED_EVENT,
        );
      }
    });
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketApproved(event: TicketApprovedEvent): Promise<void> {
    this.logger.log(`onTicketApproved ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Approved,
    });
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketRejected(event: TicketRejectedEvent): Promise<void> {
    this.logger.log(`onTicketRejected ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.Rejected,
    });
  }

  @OnEvent(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onTicketManualReviewRequired(
    event: TicketManualReviewRequiredEvent,
  ): Promise<void> {
    this.logger.log(`onTicketManualReviewRequired ${JSON.stringify(event)}`);
    await this.updateById(event.moderation.id, {
      status: ModerationStatus.RequiresManualReview,
      rejectionReason: event.moderation.rejectionReason,
    });
  }
}
```

</details>

And then do the same when the ticket is replicated in the `TicketsService` of the **moderation** micro-service:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/tickets/tickets.service.ts
import { HttpStatus, Inject, Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { ClientProxy } from "@nestjs/microservices";
import { InjectModel } from "@nestjs/mongoose";
import { EventsMap, Patterns } from "@ticketing/microservices/shared/events";
import { AcceptableError, RecoverableError } from "@ticketing/shared/errors";
import {
  ModerationTicket,
  Ticket,
  TicketStatus,
} from "@ticketing/shared/models";
import { MongoNetworkError, MongoServerClosedError } from "mongodb";
import type { Model } from "mongoose";
import { firstValueFrom, lastValueFrom, Observable, timeout, zip } from "rxjs";

import {
  type TicketApprovedEvent as InternalTicketApprovedEvent,
  type TicketCreatedEvent as InternalTicketCreatedEvent,
  type TicketRejectedEvent as InternalTicketRejectedEvent,
  TICKET_APPROVED_EVENT,
  TICKET_CREATED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { Ticket as TicketSchema, TicketDocument } from "./schemas";

type TicketWithStatus<S extends TicketStatus> = Omit<Ticket, "status"> & {
  status: S;
};

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel(TicketSchema.name) private ticketModel: Model<TicketDocument>,
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject("TICKETS_CLIENT") private ticketsClient: ClientProxy,
    @Inject("ORDERS_CLIENT") private ordersClient: ClientProxy,
  ) {}

  async create(body: Ticket): Promise<ModerationTicket> {
    const ticket = await this.ticketModel
      .create({
        ...body,
        _id: body.id,
      })
      .catch((err) => {
        if (
          err instanceof MongoNetworkError ||
          err instanceof MongoServerClosedError
        ) {
          throw new RecoverableError(
            err.message,
            HttpStatus.SERVICE_UNAVAILABLE,
            Patterns.TicketCreated,
          );
        }
        throw new AcceptableError(
          err.message,
          HttpStatus.BAD_REQUEST,
          Patterns.TicketCreated,
        );
      });
    const event: InternalTicketCreatedEvent = {
      ticket: ticket.toJSON(),
      ctx: {},
    };
    try {
      await this.eventEmitter.emitAsync(TICKET_CREATED_EVENT, event);
      return ticket.toJSON<ModerationTicket>({});
    } catch (e) {
      await this.ticketModel.deleteOne({ _id: ticket.id }).catch((err) => {
        if (
          err instanceof MongoNetworkError ||
          err instanceof MongoServerClosedError
        ) {
          throw new RecoverableError(
            err.message,
            HttpStatus.SERVICE_UNAVAILABLE,
            Patterns.TicketCreated,
          );
        }
        throw err;
      });
      throw e;
    }
  }

  async updateById<S extends TicketStatus>(
    id: string,
    status: S,
  ): Promise<TicketWithStatus<S>> {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) {
      throw new Error(`Ticket not found - ${id}`);
    }
    ticket.set({ status });
    const updatedTicket = await ticket.save();
    return updatedTicket.toJSON() as TicketWithStatus<S>;
  }

  private sendMessage<
    R extends object,
    P extends Patterns.TicketApproved | Patterns.TicketRejected =
      | Patterns.TicketApproved
      | Patterns.TicketRejected,
    E extends EventsMap[P] = EventsMap[P],
  >(client: ClientProxy, pattern: P, event: E): Observable<R> {
    return client.send(pattern, event).pipe(timeout(5000));
  }

  @OnEvent(TICKET_APPROVED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onApproved(event: InternalTicketApprovedEvent): Promise<void> {
    this.logger.debug(`onApproved ${JSON.stringify(event)}`);
    // TODO: wrap in transaction
    const ticket = await this.updateById(
      event.ticket.id,
      TicketStatus.Approved,
    );
    await lastValueFrom(
      zip(
        this.sendMessage<{ ok: boolean }>(
          this.ticketsClient,
          Patterns.TicketApproved,
          ticket,
        ),
        this.sendMessage<Ticket>(
          this.ordersClient,
          Patterns.TicketApproved,
          ticket,
        ),
      ),
    );
  }

  @OnEvent(TICKET_REJECTED_EVENT, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  async onRejected(event: InternalTicketRejectedEvent): Promise<void> {
    // TODO: wrap in transaction
    this.logger.debug(`onRejected ${JSON.stringify(event)}`);
    const ticket = await this.updateById(
      event.ticket.id,
      TicketStatus.Rejected,
    );
    await firstValueFrom(
      this.sendMessage<{ ok: boolean }>(
        this.ticketsClient,
        Patterns.TicketRejected,
        ticket,
      ),
    );
  }
}
```

</details>

> **Note**:
> Alternatively, you can use the `@nestjs/mongoose` package to handle the `MongoNetworkError` and `MongoServerClosedError` errors in a more elegant way, by setting the `connectionErrorFactory` in `MongooseModule` configuration.

### 4.5. Acceptable errors

Acceptable errors protect the system from unexpected/undesired entries and cannot be resolved by retrying or re-queuing the message.
In this case, we will log the error and drop the message.

> **Note**:
> You can find implementations of `AcceptableError` in the snippets above

### 4.6. Unidentified errors

> **Note**:
> This part is optional

Unidentified errors are errors that we have not anticipated. An intelligent way to handle those errors is to log them, send them to a dead letter queue, and drop the message.
The dead letter queue will allow us to aggregate all unidentified errors in a single queue and process them later.

The implementation of the dead letter queue is quite involved and requires several steps:

1. Define a policy to route all unidentified errors to a dead letter queue
2. Create a service that interacts with RabbitMQ management API to create the dead letter queue and bind it to the original queue
3. Create a factory that will create a policy, a queue, an exchange, and a binding for each queue
4. Trigger the factory when the application starts

Our policy will route all unidentified errors from `MODERATION_SERVICE*` queues to a dead letter queue named `MODERATION_SERVICE_DEAD_LETTER_QUEUE` with a TTL of 30 seconds.
In other words, if a message is not acknowledged within 30 seconds, it will be routed to the dead letter queue.

```json
{
  // all queues starting with MODERATION_SERVICE
  "pattern": "MODERATION_SERVICE$",
  "definition": {
    "dead-letter-exchange": "MODERATION_SERVICE_DEAD_LETTER_EXCHANGE",
    // 30 s,
    "message-ttl": 30000,
    // 1000 messages
    "max-length": 1000
  }
}
```

Let's define some interfaces to represent the API responses from RabbitMQ and our future module configuration:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/rmq/src/lib/rmq.interfaces.ts
import type { InjectionToken, OptionalFactoryDependency } from "@nestjs/common";

export interface RmqManagerOptions {
  apiUrl?: string;
  username?: string;
  password?: string;
}

export interface RmqManagerAsyncOptions {
  useFactory: (
    ...args: unknown[]
  ) => Promise<RmqManagerOptions> | RmqManagerOptions;
  inject?: (InjectionToken | OptionalFactoryDependency)[];
}

export type ApplyTo = "all" | "exchanges" | "queues";

export type ExchangeType = "topic" | "direct" | "fanout" | "match";

export enum RmqResources {
  Exchange = "exchange",
  Queue = "queue",
  Topic = "topic",
}

export type RmqState =
  | "starting"
  | "tuning"
  | "opening"
  | "running"
  | "flow"
  | "blocking"
  | "blocked"
  | "closing"
  | "closed";

export interface Connection {
  auth_mechanism?: "PLAIN" | "AMQPLAIN" | "EXTERNAL";
  client_properties: {
    connection_name?: string;
    client_id?: string;
    product?: string;
    version?: string;
    platform?: string;
    information?: string;
    capabilities?: {
      authentication_failure_close?: boolean;
      "basic.nack"?: boolean;
      "connection.blocked"?: boolean;
      consumer_cancel_notify?: boolean;
      exchange_exchange_bindings?: boolean;
      publisher_confirms?: boolean;
    };
  };
  connected_at: number; // timestamp
  name: string;
  node: string;
  peer_cert_issuer?: string | null;
  peer_cert_subject?: string | null;
  peer_cert_validity?: string | null;
  protocol: "Direct 0-9-1" | "MQTT 3.1.1" | "AMQP 0-9-1" | string;
  type: RmqResources | "network";
  user: string;
  user_who_performed_action: string | "none";
  vhost: string;
  channel_max?: number;
  channels?: number;
  frame_max?: number;
  garbage_collection?: {
    fullsweep_after: number;
    max_heap_size: number;
    min_bin_vheap_size: number;
    min_heap_size: number;
    minor_gcs: number;
  };
  host?: string; // ip address
  peer_host?: string; // ip address
  peer_port?: number;
  port?: number;
  recv_cnt?: number;
  recv_oct?: number;
  recv_oct_details?: { rate: number };
  reductions?: number;
  reductions_details?: { rate: number };
  send_cnt?: number;
  send_oct?: number;
  send_oct_details?: { rate: number };
  send_pend?: number;
  ssl?: boolean;
  ssl_cipher?: string;
  ssl_hash?: string;
  ssl_key_exchange?: string;
  ssl_protocol?: string;
  state?: RmqState;
  variable_map?: { client_id?: string };
  timeout?: number; // time in seconds
}

export interface ConnectionsResponse {
  total_count: number;
  item_count: number;
  filtered_count: number;
  page: number;
  page_size: number;
  page_count: number;
  items: Connection[];
}

export interface Queue {
  arguments: Record<string, unknown>;
  auto_delete: boolean;
  backing_queue_status: {
    avg_ack_egress_rate: number;
    avg_ack_ingress_rate: number;
    avg_egress_rate: number;
    avg_ingress_rate: number;
    // delta: ['delta', 'undefined', 0, 0, 'undefined'];
    len: number;
    mode: string;
    next_seq_id: number;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    // target_ram_count: 'infinity';
  };
  consumer_capacity: number;
  consumer_utilisation: number;
  consumers: number;
  durable: boolean;
  effective_policy_definition: Record<string, unknown>;
  exclusive: boolean;
  exclusive_consumer_tag: string | null;
  garbage_collection: {
    fullsweep_after: number;
    max_heap_size: number;
    min_bin_vheap_size: number;
    min_heap_size: number;
    minor_gcs: number;
  };
  idle_since?: string;
  head_message_timestamp: string | null;
  memory: number;
  message_bytes: number;
  message_bytes_paged_out: number;
  message_bytes_persistent: number;
  message_bytes_ram: number;
  message_bytes_ready: number;
  message_bytes_unacknowledged: number;
  messages?: number;
  messages_details?: {
    rate: number;
  };
  messages_paged_out: number;
  messages_persistent: number;
  messages_ram: number;
  messages_ready?: number;
  messages_ready_details?: {
    rate: number;
  };
  messages_ready_ram: number;
  messages_unacknowledged?: number;
  messages_unacknowledged_details?: {
    rate: number;
  };
  messages_unacknowledged_ram?: number;
  messages_stats?: {
    ack: number;
    ack_details: { rate: number };
    deliver: number;
    deliver_details: { rate: number };
    deliver_get: number;
    deliver_get_details: { rate: number };
    deliver_no_ack: number;
    deliver_no_ack_details: { rate: number };
    get: number;
    get_details: { rate: number };
    get_empty: number;
    get_empty_details: { rate: number };
    get_no_ack: number;
    get_no_ack_details: { rate: number };
    publish: number;
    publish_details: { rate: number };
    redeliver: number;
    redeliver_details: { rate: number };
  };
  name: string;
  node: string;
  operator_policy: string | null;
  policy: string | null;
  recoverable_slaves: string | null;
  reductions?: number;
  reductions_details?: {
    rate: number;
  };
  single_active_consumer_tag: string | null;
  state: RmqState;
  type: "classic" | string;
  vhost: string;
}

export interface Exchange {
  arguments: Record<string, unknown>;
  auto_delete: boolean;
  durable: boolean;
  internal: boolean;
  message_stats: {
    publish_in: number;
    publish_in_details: { rate: number };
    publish_out: number;
    publish_out_details: { rate: number };
  };
  name: string;
  policy: string | null;
  type: ExchangeType;
  user_who_performed_action: "string";
  vhost: string;
}

export interface Message {
  payload_bytes: number;
  redelivered: boolean;
  exchange: string;
  routing_key: string;
  message_count: number;
  properties: {
    reply_to?: string;
    correlation_id: string;
    delivery_mode: number;
    headers: Record<string, unknown>;
  };
  payload: string;
  payload_encoding: "string";
}

export interface PaginatedResponse<T> {
  filtered_count: number;
  item_count: number;
  items: T[];
  page: number;
  page_count: number;
  page_size: number;
  total_count: number;
}

export type QueuesResponse = PaginatedResponse<Queue>;

export type ExchangesResponse = PaginatedResponse<Exchange>;
```

</details>

Our `RmqManagerService` will provide methods to interact with RabbitMQ management HTTP API and will be responsible for creating the dead letter queue and binding it to the original queue:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/rmq/src/lib/rmq.service.ts
import { HttpService } from "@nestjs/axios";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Options } from "amqplib";
import { firstValueFrom } from "rxjs";

import type {
  ApplyTo,
  ExchangesResponse,
  ExchangeType,
  Message,
  QueuesResponse,
} from "./rmq.interfaces";

type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
  : S;

type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};

const toSnakeCaseProperties = <T extends object>(obj: T): KeysToSnakeCase<T> =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    const snakeCaseKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`,
    );
    return { ...acc, [snakeCaseKey]: value };
  }, {} as KeysToSnakeCase<T>);

/*
 * @see http://localhost:15672/api/index.html for RabbitMQ management API docs
 */
@Injectable()
export class RmqManagerService {
  readonly logger = new Logger(RmqManagerService.name);

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {
    this.httpService.axiosRef.interceptors.response.use(
      (response) => response,
      (error) => {
        // handling errors as described in https://axios-http.com/docs/handling_errors
        this.logger.error(error.message);
        if (error.response) {
          const err = new Error("Error response received");
          console.error(error);
          return Promise.reject(err);
        } else if (error.request) {
          const err = new Error(error.message);
          return Promise.reject(err);
        }
        return Promise.reject(new Error(error.message));
      },
    );
  }

  async setPolicy(
    policyName: string,
    options: {
      pattern: string;
      definition: Record<string, string | number>;
      applyTo?: ApplyTo;
      priority?: number;
    },
    vhost: string = "/",
  ): Promise<void> {
    const { pattern, definition, applyTo = "all", priority = 0 } = options;
    this.logger.debug(
      `Setting policy ${policyName} on ${applyTo} for pattern ${pattern}.`,
    );
    const encodedVhost = encodeURIComponent(vhost);
    await firstValueFrom(
      this.httpService.put(`/policies/${encodedVhost}/${policyName}`, {
        pattern,
        definition,
        applyTo,
        priority,
      }),
    );
  }

  async getQueues(
    options: {
      page?: number;
      pageSize?: number;
      name?: string;
      useRegex?: boolean;
      sortReverse?: boolean;
      pagination?: boolean;
    } = {},
    vhost: string = "/",
  ): Promise<QueuesResponse> {
    const params = {
      page: 1,
      page_size: 100,
      use_regex: false,
      sort_reverse: false,
      pagination: true,
      ...toSnakeCaseProperties(options),
    };
    const { data } = await firstValueFrom(
      this.httpService.get<QueuesResponse>("/queues", {
        params,
        headers: { "x-vhost": vhost },
      }),
    );
    return data;
  }

  /**
   * @todo: investigate invalid response
   * for some mysterious reason the axios request always returns 200 OK with empty array
   * whether the queue is empty or not
   *
   * When using the curl command, the response is correct
   * curl  -X POST \
   * 'http://localhost:15672/api/queues/%2F/MODERATION_SERVICE_QUEUE_TEST/get' \
   * --header 'Authorization: Basic xxxxxx' \
   * --header 'Content-Type: application/json' \
   * --data-raw '{
   * "count": 1,
   * "ackmode": "ack_requeue_true",
   * "encoding": "auto",
   * "truncate": 50000
   *}'
   *
   **/
  async getMessages(
    queueName: string,
    options: {
      count?: number;
      ackmode?:
        | "ack_requeue_true"
        | "reject_requeue_true"
        | "ack_requeue_false"
        | "reject_requeue_false";
      encoding?: "auto" | "base64";
      truncate?: number;
    } = {},
    vhost: string = "/",
  ): Promise<Message[]> {
    const defaultOptions = {
      count: 1,
      ackmode: "ack_requeue_true",
      encoding: "auto",
    };
    const body = {
      ...defaultOptions,
      ...options,
    };
    const encodedVhost = encodeURIComponent(vhost);
    console.warn({ url: `/queues/${encodedVhost}/${queueName}/get` });
    const { data } = await firstValueFrom(
      this.httpService.post<Message[]>(
        `/queues/${encodedVhost}/${queueName}/get`,
        body,
      ),
    );
    return data;
  }

  async setQueue(
    queueName: string,
    options: Options.AssertQueue,
    vhost: string = "/",
  ): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    const body = toSnakeCaseProperties(options);
    await firstValueFrom(
      this.httpService.put(`/queues/${encodedVhost}/${queueName}`, body),
    );
  }

  async deleteQueue(queueName: string, vhost: string = "/"): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    await firstValueFrom(
      this.httpService.delete(`/queues/${encodedVhost}/${queueName}`, {
        params: { if_empty: true, if_unused: true },
      }),
    );
  }

  async getExchanges(
    options: {
      page?: number;
      pageSize?: number;
      name?: string;
      useRegex?: boolean;
      sortReverse?: boolean;
      pagination?: boolean;
    } = {},
    vhost: string = "/",
  ): Promise<ExchangesResponse> {
    const params = {
      page: 1,
      page_size: 100,
      use_regex: false,
      sort_reverse: false,
      pagination: true,
      ...toSnakeCaseProperties(options),
    };
    const { data } = await firstValueFrom(
      this.httpService.get<ExchangesResponse>("/exchanges", {
        params,
        headers: { "x-vhost": vhost },
      }),
    );
    return data;
  }

  async setExchange(
    exchangeName: string,
    options: Options.AssertExchange,
    exchangeType: ExchangeType = "topic",
    vhost: string = "/",
  ): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    const body = toSnakeCaseProperties({ ...options, type: exchangeType });
    await firstValueFrom(
      this.httpService.put(`/exchanges/${encodedVhost}/${exchangeName}`, body),
    );
  }

  async deleteExchange(
    exchangeName: string,
    vhost: string = "/",
  ): Promise<void> {
    const encodedVhost = encodeURIComponent(vhost);
    await firstValueFrom(
      this.httpService.delete(`/exchanges/${encodedVhost}/${exchangeName}`, {
        params: { if_unused: true },
      }),
    );
  }
}
```

</details>

The `RmqManagerModule` will configure the `HttpModule` and provide the `RmqManagerService` :

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/rmq/src/lib/rmq.module.ts
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";

import { RmqManagerOptions } from "./rmq.interfaces";
import { RmqManagerService } from "./rmq.service";

const DEFAULT_API_URL = "http://localhost:15672/api";

@Module({})
export class RmqManagerModule {
  static forRoot(
    options: RmqManagerOptions = {
      apiUrl: DEFAULT_API_URL,
    },
  ): DynamicModule {
    const providers = [
      {
        provide: "RMQ_MANAGER_OPTIONS",
        useValue: options,
      },
      RmqManagerService,
    ];

    return {
      module: RmqManagerModule,
      imports: [
        HttpModule.register({
          baseURL: options.apiUrl,
          ...(options.password &&
            options.username && {
              auth: { username: options.username, password: options.password },
            }),
          headers: { "content-type": "application/json" },
          timeout: 5000,
          timeoutErrorMessage: "Request to RMQ manager timed out",
        }),
      ],
      providers,
      exports: providers,
    };
  }
}
```

</details>

Finally, export all classes in `libs/microservices/shared/rmq/src/index.ts`, and we will able to lazy load the `RmqManagerModule` to create the dead letter exchange policy when the application starts:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/main.ts
import { AmqpOptions, AmqpServer } from "@getlarge/nestjs-tools-amqp-transport";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LazyModuleLoader, NestFactory } from "@nestjs/core";
import { CustomStrategy } from "@nestjs/microservices";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { GLOBAL_API_PREFIX } from "@ticketing/microservices/shared/constants";
import { Services } from "@ticketing/shared/constants";

import { AppModule } from "./app/app.module";
import { type AppConfigService } from "./app/env";
import { GlobalFilter } from "./app/filters/global.filter";
import { GlobalGuard } from "./app/guards/global.guard";
import { GlobalInterceptor } from "./app/interceptors/global.interceptor";
import { globalMiddleware } from "./app/middlewares/global.middleware";
import { GlobalPipe } from "./app/pipes/global.pipe";

const DEFAULT_PORT = 3090;

async function createRmqPolicy(app: NestFastifyApplication): Promise<void> {
  const lazyModuleLoader = app.get(LazyModuleLoader);
  const configService = app.get<AppConfigService>(ConfigService);
  const { RmqManagerModule, RmqManagerService } = await import(
    "@ticketing/microservices/shared/rmq"
  );
  const moduleRef = await lazyModuleLoader.load(() =>
    RmqManagerModule.forRoot({
      apiUrl: configService.get("RMQ_MANAGEMENT_API_URL"),
      username: "guest",
      password: "guest",
    }),
  );
  const rmqManager = moduleRef.get(RmqManagerService);

  const pattern = "MODERATION_SERVICE$";
  const deadLetterExchange = "MODERATION_SERVICE_DEAD_LETTER_EXCHANGE";
  const definition = {
    "message-ttl": 30000,
    "max-length": 1000,
    "dead-letter-exchange": deadLetterExchange,
  };
  const policyName = "MODERATION_SERVICE_DLX_POLICY";
  const vhost = "/";
  await rmqManager.setPolicy(
    policyName,
    {
      pattern,
      definition,
    },
    vhost,
  );

  await rmqManager.setExchange(
    deadLetterExchange,
    { autoDelete: false, durable: true },
    "topic",
    vhost,
  );
}
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      trustProxy: true,
      bodyLimit: +process.env.MAX_PAYLOAD_SIZE || 1048576,
    }),
    { bufferLogs: true, abortOnError: false },
  );
  app.setGlobalPrefix(GLOBAL_API_PREFIX);
  app.enableShutdownHooks();

  app.use(globalMiddleware);
  app.useGlobalGuards(new GlobalGuard());
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.useGlobalPipes(new GlobalPipe());
  app.useGlobalFilters(new GlobalFilter());

  await createRmqPolicy(app);

  const configService = app.get<AppConfigService>(ConfigService);
  const port = configService.get("PORT", { infer: true }) ?? DEFAULT_PORT;

  const amqpOptions: AmqpOptions = {
    urls: [configService.get("RMQ_URL") as string],
    persistent: true,
    noAck: false,
    prefetchCount: configService.get("RMQ_PREFETCH_COUNT"),
    isGlobalPrefetchCount: false,
    queue: `${Services.MODERATION_SERVICE}_QUEUE`,
    queueOptions: {
      durable: true,
      exclusive: false,
      autoDelete: false,
    },
    socketOptions: {
      keepAlive: true,
      heartbeatIntervalInSeconds: 30,
      reconnectTimeInSeconds: 1,
    },
  };
  const options: CustomStrategy = {
    strategy: new AmqpServer(amqpOptions),
  };
  const microService = app.connectMicroservice(options);
  await microService.listen();
  await app.listen(port, "0.0.0.0", () => {
    Logger.log(`Listening at http://localhost:${port}/${GLOBAL_API_PREFIX}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

</details>

<!-- endregion -->

## 5. Send email notifications to moderators

<!-- region nestjs-workshop-phase-2c-chapter-5 -->

> **Note**:
> This section is optional and can be skipped if you are running out of time.

When a manual review is required, we want to send an email to moderators with a link to the moderation API.
Ideally, we could generate signed URLs to allow moderators to approve/reject tickets without having to log in.

We will use [MailSlurper](https://github.com/mailslurper/mailslurper) to test the email-sending process along with [Nodemailer](https://nodemailer.com/about/) to send the emails.

### 5.1. Install dependencies

Add the following dependencies to the `package.json`

```sh
yarn add nodemailer
yarn add -D @types/nodemailer
```

### 5.2. Create MailerModule

First, we will create a new NestJS library `libs/microservices/mailer`:

```sh
npx nx g @nx/nest:lib microservices-shared-mailer --directory=libs/microservices/shared/mailer --tags=scope:shared,type:util,platform:server --importPath=@ticketing/microservices/shared/mailer
```

</details>

Then, we will create a `MailerOptions` interface to define the configuration options for the `MailerModule`:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/mailer/src/lib/mailer.interfaces.ts
import { InjectionToken, ModuleMetadata } from "@nestjs/common";

export type MailerOptions = MailerOptionsWithObject | MailerOptionsWithUrl;

export interface BaseMailerOptions {
  fromName?: string;
  fromAddress: string;
}

export interface MailerOptionsWithObject extends BaseMailerOptions {
  host: string;
  port: number;
  secure?: boolean;
  user?: string;
  password?: string;
}

export interface MailerOptionsWithUrl extends BaseMailerOptions {
  url: string;
}

export interface MailerAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFactory: (...args: any[]) => Promise<MailerOptions> | MailerOptions;
  inject?: InjectionToken[];
}
```

And we will use those interfaces to configure the `MailerModule`:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/mailer/src/lib/mailer.module.ts
import { DynamicModule, Module } from "@nestjs/common";

import { MailerAsyncOptions, MailerOptions } from "./mailer.interfaces";
import { MailerService } from "./mailer.service";

@Module({})
export class MailerModule {
  static forRoot(options: MailerOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: "MAILER_OPTIONS",
          useValue: options,
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }

  static forRootAsync(options: MailerAsyncOptions): DynamicModule {
    return {
      module: MailerModule,
      imports: options.imports,
      providers: [
        {
          provide: "MAILER_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        MailerService,
      ],
      exports: [MailerService],
    };
  }
}
```

</details>

### 5.3. Create MailerService provider

The email sending and template rendering logic will be implemented in the `MailerService`:

<details>
<summary>Solution</summary>

```ts
// libs/microservices/shared/mailer/src/lib/mailer.service.ts
import { Inject, Injectable, Logger } from "@nestjs/common";
import handlebars from "handlebars";
import { readFile } from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createTransport, Transporter } from "nodemailer";
import type { Address } from "nodemailer/lib/mailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

import type { MailerOptions } from "./mailer.interfaces";

const __dirname = dirname(fileURLToPath(import.meta.url));

@Injectable()
export class MailerService {
  readonly logger = new Logger(MailerService.name);
  private readonly transporter: Transporter;

  constructor(
    @Inject("MAILER_OPTIONS") private readonly options: MailerOptions,
  ) {
    this.transporter = createTransport(this.transport);
  }

  get from(): Address {
    return {
      name: this.options.fromName ?? this.options.fromAddress,
      address: this.options.fromAddress,
    };
  }
  get transport(): SMTPTransport["options"] {
    const baseOptions = {
      from: {
        name: this.options.fromName ?? this.options.fromAddress,
        address: this.options.fromAddress,
      },
      debug: true,
      tls: {
        rejectUnauthorized: false,
      },
    } satisfies SMTPTransport["options"];

    if ("url" in this.options) {
      return {
        ...baseOptions,
        url: this.options.url,
      };
    }
    return {
      ...baseOptions,
      host: this.options.host,
      port: this.options.port,
      secure: this.options.secure,
      ...(this.options.user && this.options.password
        ? {
            auth: {
              user: this.options.user,
              pass: this.options.password,
            },
          }
        : {}),
    } satisfies SMTPTransport["options"];
  }

  async sendMail(
    to: string | string[],
    subject: string,
    html: string,
  ): Promise<void> {
    const response = await this.transporter.sendMail({
      to,
      subject,
      html,
      from: this.from,
    });
    this.logger.debug(response);
  }

  async renderTemplate(
    template: `${string}.hbs`,
    context: Record<string, unknown>,
  ): Promise<string> {
    const templatePath = path.join(__dirname, "..", "templates", template);
    const templateContent = await readFile(templatePath, "utf8");
    const compiledTemplate = handlebars.compile(templateContent);
    return compiledTemplate(context);
  }
}
```

</details>

### 5.4. Create email templates

We will create a `moderation-required` `Handlebars` template to inform moderators about the ticket requiring manual moderation:

<details>
<summary>Solution</summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Moderation Required</title>
  </head>

  <body>
    <h1>Moderation Required</h1>
    <p>A ticket requires manual moderation:</p>
    <p>Moderation ID: {{ moderationId }}</p>
    <p>Ticket ID: {{ ticketId }}</p>
    <p>Ticket title: {{ title }}</p>
    <p>Reason: {{ reason }}</p>
    {{!-- <a href="{{ approveLink }}">Approve</a>
    <a href="{{ rejectLink }}">Reject</a> --}}
  </body>
</html>
```

</details>

### 5.4. Integrate MailerModule in moderation micro-service

Update `ModerationEnvironmentVariables` to add:

- `mailslurper` configuration
- sender name and address
- moderators emails

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/env/moderation-environment-variables.ts
import { applyDecorators } from "@nestjs/common";
import { Expose, Transform, Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from "class-validator";
import { decorate } from "ts-mixer";

export const IsThresholdDecorator = (): PropertyDecorator => {
  return applyDecorators(
    Expose(),
    Type(() => Number),
    IsNumber(),
    Min(0),
    Max(1),
  );
};

export class ModerationEnvironmentVariables {
  @decorate(Expose())
  @decorate(IsString())
  OPENAI_API_KEY: string;

  @decorate(IsThresholdDecorator())
  MODERATION_HATE_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HATE_THREATENING_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HARASSMENT_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_HARASSMENT_THREATENING_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_INTENT_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SELF_HARM_INSTRUCTIONS_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SEXUAL_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_SEXUAL_MINORS_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_VIOLENCE_THRESHOLD?: number = 0.7;

  @decorate(IsThresholdDecorator())
  MODERATION_VIOLENCE_GRAPHIC_THRESHOLD?: number = 0.7;

  @decorate(Expose())
  @decorate(
    IsUrl({
      require_tld: false,
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ["smtp", "smtps"],
    }),
  )
  MAILER_URL?: string =
    "smtps://test:test@localhost:1025/?skip_ssl_verify=true";

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsString())
  MAILER_FROM_NAME?: string = "Ticketing";

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(IsEmail())
  MAILER_FROM_ADDRESS?: string = "no-reply@ticketing.local";

  @decorate(Expose())
  @decorate(IsOptional())
  @decorate(
    Transform(
      ({ value }) => (value ? value.split(",").map((v) => v.trim()) : []),
      { toClassOnly: true },
    ),
  )
  @decorate(IsArray())
  @decorate(IsEmail({}, { each: true }))
  MODERATORS_EMAILS?: string[] = [];
}
```

</details>

Import and configure the `MailerModule` in `ModerationsModule`:

<details>
<summary>Solution</summary>

```ts
// apps/moderation/src/app/moderations/moderations.module.ts
import {
  OryPermissionsModule,
  OryRelationshipsModule,
} from "@getlarge/keto-client-wrapper";
import { OryFrontendModule } from "@getlarge/kratos-client-wrapper";
import { LockModule } from "@getlarge/nestjs-tools-lock";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ScheduleModule } from "@nestjs/schedule";
import { MailerModule } from "@ticketing/microservices/shared/mailer";
import { redisStore } from "cache-manager-ioredis-yet";
import type { RedisOptions } from "ioredis";
import { URL } from "node:url";

import { ContentGuardModule } from "../content-guard/content-guard.module";
import { AppConfigService } from "../env";
import { QueueNames } from "../shared/queues";
import { TicketSchema } from "../tickets/schemas";
import { ModerationsController } from "./moderations.controller";
import { ModerationsProcessor } from "./moderations.processor";
import { ModerationsService } from "./moderations.service";
import { ModerationsTasks } from "./moderations.tasks";
import { ModerationSchema } from "./schemas";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Moderation", schema: ModerationSchema },
      { name: "Ticket", schema: TicketSchema },
    ]),
    BullModule.registerQueueAsync({
      name: QueueNames.MODERATE_TICKET,
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          connection: redisOptions,
          sharedConnection: true,
        };
      },
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: AppConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        const store = await redisStore(redisOptions);
        return {
          store,
        };
      },
    }),
    LockModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const { port, hostname, password } = new URL(
          configService.get("REDIS_URL"),
        );
        const redisOptions: RedisOptions = {
          port: configService.get<number>("REDIS_PORT") || +port,
          host: configService.get<string>("REDIS_HOSTNAME") || hostname,
          db: configService.get<number>("REDIS_DB"),
          password: configService.get<string>("REDIS_PASSWORD") || password,
          retryStrategy(times: number): number {
            return Math.min(times * 500, 2000);
          },
          reconnectOnError(): boolean | 1 | 2 {
            return 1;
          },
        };
        return {
          redis: redisOptions,
          lock: {
            retryCount: 0,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => {
        const { protocol, hostname, port, password, username } = new URL(
          configService.get("MAILER_URL"),
        );
        const fromAddress = configService.get("MAILER_FROM_ADDRESS");
        return {
          host: hostname,
          port: +port,
          secure: protocol.startsWith("smtps"),
          user: username,
          password,
          fromName: configService.get("MAILER_FROM_NAME") ?? fromAddress,
          fromAddress,
        };
      },
    }),
    OryFrontendModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KRATOS_PUBLIC_URL"),
      }),
    }),
    OryPermissionsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        basePath: configService.get("ORY_KETO_PUBLIC_URL"),
      }),
    }),
    OryRelationshipsModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        accessToken: configService.get("ORY_KETO_API_KEY"),
        basePath: configService.get("ORY_KETO_ADMIN_URL"),
      }),
    }),
    ContentGuardModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: AppConfigService) => ({
        openAIApiKey: configService.get("OPENAI_API_KEY"),
      }),
    }),
  ],
  controllers: [ModerationsController],
  providers: [ModerationsProcessor, ModerationsService, ModerationsTasks],
})
export class ModerationsModule {}
```

</details>

Update the `ModerationsProcessor` to send an email to moderators when a ticket title requires manual moderation:

<details>

```ts
// apps/moderation/src/app/moderations/moderations.processor.ts
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AsyncLocalStorageService } from "@ticketing/microservices/shared/async-local-storage";
import { MailerService } from "@ticketing/microservices/shared/mailer";
import {
  Moderation,
  ModerationStatus,
  TicketStatus,
} from "@ticketing/shared/models";
import type { Job } from "bullmq";

import {
  ContentGuardService,
  IOpenAIModerationResponse,
} from "../content-guard/content-guard.service";
import type { AppConfigService } from "../env";
import {
  EventsMap,
  TICKET_APPROVED_EVENT,
  TICKET_MANUAL_REVIEW_REQUIRED_EVENT,
  TICKET_REJECTED_EVENT,
} from "../shared/events";
import { ModerateTicket, QueueNames } from "../shared/queues";

@Processor(QueueNames.MODERATE_TICKET)
export class ModerationsProcessor extends WorkerHost {
  readonly logger = new Logger(ModerationsProcessor.name);

  constructor(
    @Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2,
    @Inject(AsyncLocalStorageService)
    private readonly asyncLocalStorageService: AsyncLocalStorageService,
    @Inject(ContentGuardService)
    private readonly contentGuardService: ContentGuardService,
    @Inject(ConfigService) private readonly configService: AppConfigService,
    @Inject(MailerService) private readonly mailerService: MailerService,
  ) {
    super();
  }

  private async emitEventAsync<T extends keyof EventsMap>(
    eventName: T,
    event: EventsMap[T],
  ): Promise<void> {
    await this.eventEmitter.emitAsync(eventName, event);
  }

  async process(
    job: Job<ModerateTicket>,
  ): Promise<{ status: ModerationStatus }> {
    const { ctx, ticket, moderation } = job.data;
    this.asyncLocalStorageService.enter();
    this.asyncLocalStorageService.set("REQUEST_CONTEXT", ctx);
    const { status, rejectionReason } = await this.moderateTicket(job.data);
    switch (status) {
      case ModerationStatus.Approved:
        await this.emitEventAsync(TICKET_APPROVED_EVENT, {
          ctx,
          moderation: { ...moderation, status: ModerationStatus.Approved },
          ticket: { ...ticket, status: TicketStatus.Approved },
        });
        break;
      case ModerationStatus.Rejected:
        await this.emitEventAsync(TICKET_REJECTED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.Rejected,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.Rejected },
        });
        break;
      case ModerationStatus.RequiresManualReview:
        await this.emitEventAsync(TICKET_MANUAL_REVIEW_REQUIRED_EVENT, {
          ctx,
          moderation: {
            ...moderation,
            status: ModerationStatus.RequiresManualReview,
            rejectionReason,
          },
          ticket: { ...ticket, status: TicketStatus.WaitingModeration },
        });
        await this.sendModerationEmail(ticket, {
          ...moderation,
          status: ModerationStatus.RequiresManualReview,
          rejectionReason,
        });
        break;
      default:
        break;
    }
    return { status };
  }

  private get categoryThresholds(): IOpenAIModerationResponse["results"][0]["category_scores"] {
    return {
      hate: this.configService.get("MODERATION_HATE_THRESHOLD"),
      "hate/threatening": this.configService.get(
        "MODERATION_HATE_THREATENING_THRESHOLD",
      ),
      harassment: this.configService.get("MODERATION_HARASSMENT_THRESHOLD"),
      "harassment/threatening": this.configService.get(
        "MODERATION_HARASSMENT_THREATENING_THRESHOLD",
      ),
      "self-harm": this.configService.get("MODERATION_SELF_HARM_THRESHOLD"),
      "self-harm/intent": this.configService.get(
        "MODERATION_SELF_HARM_INTENT_THRESHOLD",
      ),
      "self-harm/instructions": this.configService.get(
        "MODERATION_SELF_HARM_INSTRUCTIONS_THRESHOLD",
      ),
      sexual: this.configService.get("MODERATION_SEXUAL_THRESHOLD"),
      "sexual/minors": this.configService.get(
        "MODERATION_SEXUAL_MINORS_THRESHOLD",
      ),
      violence: this.configService.get("MODERATION_VIOLENCE_THRESHOLD"),
      "violence/graphic": this.configService.get(
        "MODERATION_VIOLENCE_GRAPHIC_THRESHOLD",
      ),
    };
  }

  private async moderateTicket(
    jobData: ModerateTicket,
  ): Promise<{ status: ModerationStatus; rejectionReason?: string }> {
    const { ticket } = jobData;
    const isMatched = this.contentGuardService.matchesDictionary(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        isMatched ? "matched" : "not matched"
      } with dictionary`,
    );
    if (isMatched) {
      const rejectionReason = `Ticket title contains inappropriate language`;
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    const {
      flagged,
      categories,
      category_scores: scores,
    } = await this.contentGuardService.isFlagged(ticket.title);
    this.logger.debug(
      `Ticket: ${ticket.title} is ${
        flagged ? "flagged" : "not flagged"
      } by OpenAI`,
    );
    if (flagged) {
      const thresholdConfig = this.categoryThresholds;
      const uncertainCategories = Object.entries(scores).filter(
        ([category, score]) => score < thresholdConfig[category],
      );
      if (uncertainCategories.length) {
        const rejectionReason = `Ticket title classification requires manual review : ${uncertainCategories
          .map(([category]) => category)
          .join(", ")}`;
        this.logger.debug(rejectionReason);
        return {
          status: ModerationStatus.RequiresManualReview,
          rejectionReason,
        };
      }

      const flaggedCategories = Object.entries(categories)
        .filter((category) => category[1])
        .map(([category]) => category);
      const rejectionReason = `Ticket title contains inappropriate language in categories: ${flaggedCategories.join(
        ", ",
      )}`;
      this.logger.debug(rejectionReason);
      return { status: ModerationStatus.Rejected, rejectionReason };
    }

    return Promise.resolve({ status: ModerationStatus.Approved });
  }

  private async sendModerationEmail(
    ticket: ModerateTicket["ticket"],
    moderation: Moderation,
  ): Promise<void> {
    const recipients = this.configService.get("MODERATORS_EMAILS", {
      infer: true,
    });
    if (!recipients.length) {
      return Promise.resolve();
    }
    const html = await this.mailerService.renderTemplate(
      "moderation-required.hbs",
      {
        moderationId: moderation.id,
        title: ticket.title,
        ticketId: ticket.id,
        reason: moderation.rejectionReason,
      },
    );
    await this.mailerService.sendMail(recipients, "Moderation Required", html);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<ModerateTicket>): void {
    this.logger.log(`Job: ${QueueNames.MODERATE_TICKET}-${job.id} completed`);
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("error")
  onError(error: Error): void {
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET} errored : ${error.message}`,
    );
    this.asyncLocalStorageService.exit();
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<ModerateTicket>, error: Error): void {
    const { failedReason } = job;
    this.logger.error(
      error,
      `Job: ${QueueNames.MODERATE_TICKET}-${job.id} failed : ${failedReason}`,
    );
    this.asyncLocalStorageService.exit();
  }
}
```

</details>

<!-- endregion -->

## TODOs

- [ ] Add pagination to ModerationsController response using `PaginateQuery` and `PaginatedDto<ModerationDto>`
- [ ] Forbid ticket title update (to avoid moderation bypass) in tickets micro-service (`UpdateTicket`, `UpdateTicketDto` and ng-client `update-ticket-modal` component)
- [ ] Manage moderation jobs in moderation micro-service
