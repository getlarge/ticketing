# Ticketing (think concert tickets)

📚 This repository is a learning resource for building a full-stack application with [Nx](https://nx.dev), [NestJS](https://nestjs.com), [Angular](https://angular.dev), and [Ory](https://ory.sh).

It shows:

- how to organize internal dependencies
- tricks to use [Fastify](https://fastify.dev) with `NestJS`
- tricks to consume and produce ES6 modules with `NestJS`, `Jest` and `Nx`
- how to integrate `Ory` in `NestJS` and `Angular` apps for authentication and authorization flows
- how to set up `Ory` in local and remote working environments
- how to use [RabbitMQ](https://www.rabbitmq.com) with `NestJS`
- how to define/validate environment variables
- how to containerize Nx apps with [Docker](https://www.docker.com)
- how to integrate Nx into a [Kubernetes](https://kubernetes.io) workflow
- how to dynamically rebuild `Docker` images based on the `Nx` project graph

And there is even a list of [challenges](./CHALLENGES.md)! 🏁

> [!NOTE]
> This project is inspired by Stephen Grider's [Microservices with Node JS and React](https://www.udemy.com/course/microservices-with-node-js-and-react/) course on Udemy, starting in chapter 5.
> You can find the source code for the course [here](https://github.com/StephenGrider/ticketing).

## User story

```mermaid
journey
  title Exchanging tickets online
  section Register
    Create a user: 3: Seller, Buyer
    Signin : 3: Seller
  section Search tickets
    Find by name: 5: Buyer, Seller
  section Create ticket offer
    Write description: 3: Seller
    Define price: 3: Seller
  section Buy ticket
    Reserve tickets: 5: Buyer
    Place order: 3: Buyer
    Pay ticket: 3: Buyer
  section Check orders
    See orders list: 5: Seller, Buyer
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
    LB --->|HTTP| AS & TS & OS & PS
    RMQ <-.->|AMQP| TS & OS & ES & PS
    TS & OS & PS -->|HTTP| ORY
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

```

## Entities

```mermaid
---
title: Ticketing entities
---
erDiagram
    User ||--o{ Ticket : owns
    User ||--o{ Order : owns
    User ||--o{ Payment : owns
    Ticket ||--o| Order : "bound to"
    Order ||--o| Payment : "bound to"

    User {
        int id PK
        string email "unique"
    }
    Ticket {
        string id PK
        string title
        float price
        int version
        string userId FK
        string orderId FK "Optional"
    }
    Order {
        string id PK
        string status
        int version
        string ticketId FK
        string userId FK
    }
    Payment {
        string id PK
        string orderId FK
        string stripeId "Charge ID from Stripe"
        int version
    }
```

## Permissions

Permissions are granted or denied using Ory Permissions (Keto) [policies](https://www.ory.sh/docs/keto/).

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
    Group o-- User : "members"
    Ticket o-- User : "owners"
    Order o-- User : "owners"
    Order *-- Ticket : "parents"
    Payment o-- User : "owners"
    Payment *-- Order : "parents"

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
```

## Events

```mermaid
sequenceDiagram
  participant Tickets service
  participant Orders service
  participant Payments service
  participant Expiration service
  participant RMQ

  loop ticket:created
    %% event emitted by tickets service
    Tickets service->>+RMQ: Publish new ticket
    RMQ-->>-Orders service: Dispatch new ticket
    Note left of Orders service: Orders service needs to know <br> about tickets that can be reserved.
  end

  loop ticket:updated
    %% event emitted by tickets service
    Tickets service->>+RMQ: Publish updated ticket
    RMQ-->>-Orders service: Dispatch updated ticket
    Note left of Orders service: Orders service needs to know <br> if tickets price have changed and <br>if they are successfully reserved
  end

  loop order:created
    %% event emitted by orders service
    Orders service->>+RMQ: Publish new order
    par RMQ to Tickets service
      RMQ->>Tickets service: Dispatch new order
      Note left of Tickets service: Tickets service needs to know<br>if a ticket has been reserved<br>to prevent its edition.
      and RMQ to Payments service
      RMQ->>Payments service: Dispatch new order
      Note left of Payments service: Payments service needs to know<br>there is a new order that a user<br>might submit a payment for.
      and RMQ to Expiration service
      RMQ->>Expiration service: Dispatch new order
      Note left of Expiration service: Expiration service needs to start<br>a timer to eventually time out<br>this order.
    end
  end


  loop order:cancelled
    %% event emitted by orders service
    Orders service->>+RMQ: Publish cancelled order
    par RMQ to Tickets service
      RMQ->>Tickets service: Dispatch cancelled order
      Note left of Tickets service: Tickets service should unreserve ticket<br>if the corresponding order has been<br>cancelled so this ticket can be <br>edited again
      and RMQ to Payments service
      RMQ->>Payments service: Dispatch cancelled order
      Note left of Payments service: Payments service should know that<br>any incoming payments for this order<br>should be rejected
    end
  end

  loop expiration:complete
    %% event emitted by expiration service
    Expiration service->>+RMQ: Publish complete expiration
    par RMQ to Orders service
      RMQ->>Orders service: Dispatch expired order
      Note left of Orders service: Orders service needs to know that an order<br>has gone over the 15 minutes time limit.<br>It is up to the order service to decide<br> wether or not to cancel the order.
    end
  end

  loop payment:created
    %% event emitted by payments service
    Payments service->>+RMQ: Publish payment created
    par RMQ to Orders service
      RMQ->>Orders service: Dispatch payment created
      Note left of Orders service: Orders service needs to know that an order<br>has been paid for.
    end
  end
```

## Environment variables

I am using [dotenv-vault](https://vault.dotenv.org/) to manage environment variables.
You can fork the project and use the following links to create your Dotenv project by forking the corresponding Dotenv project.

| project                                    | fork                                                                                                                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [docker](./.env.vault)                     | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/prj_7dc625e23d6655d88f5fc340b5118f4f645cfe8b150522df15202cfe7390f9ad/example) |
| [auth](./apps/auth/.env.vault)             | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/prj_04b3110a437ffb0447545472cbc5a24cb10a00175f184291e0f87e3d3713b156/example) |
| [expiration](./apps/expiration/.env.vault) | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/prj_d12d931099f7e9b4188b46de1b2a6f3e05d6eb84df4cf153bd99fc56b724bf17/example) |
| [moderation](./apps/moderation/.env.vault) | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/vlt_a873660ea5f4c049dab8f0c5900682319d22dbafdb16523a8fece8fa32c30f58/example) |
| [orders](./apps/orders/.env.vault)         | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/prj_d9f6776d63a2f5a2f5344e560b46d73682de9609903b0008854038df27a57663/example) |
| [payments](./apps/payments/.env.vault)     | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/prj_f06df46b19ae0475561401ec975eae4971efba53f4882716572b79016fd4127d/example) |
| [tickets](./apps/tickets/.env.vault)       | [![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/prj_2ab6048cf86dd07e93a4eb095220e88b7428731454962e0f7ad9eb51fde7e2cc/example) |

## Useful commands

... to run after configuring the required environment variables

```bash
# build custom Nginx Proxy
yarn docker:proxy:build

# build custom RabbitMQ node
yarn docker:rmq:build

# start the Storage and Broker dependencies (mongo, redis, rabbitmq)
yarn docker:deps:up

# start Nginx Proxy (for backend services and frontend app)
yarn docker:proxy:up

# Generate Ory network configuration from .env
yarn ory:generate:kratos
yarn ory:generate:keto

# start Ory network (Kratos and Keto with database migrations)
yarn docker:ory:up

# start backend services
yarn start:backend

# start (Angular) frontend app
yarn start:frontend:local

```
