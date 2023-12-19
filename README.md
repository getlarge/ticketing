# Ticketing (think concert tickets)

This is a remix of the app built in the course [microservices with node.js and react](https://www.udemy.com/course/microservices-with-node-js-and-react/) starting at chapter 5.
Source code for the course can be found [here](https://github.com/StephenGrider/ticketing).

This repository shows:

- another way to manage shared/common modules (with [Nx](https://nx.dev))
- tricks to use [Fastify](https://fastify.dev) with [NestJS](https://nestjs.com)
- tricks to consume and produce ES6 modules with NestJS (and Nx)
- how to integrate [Ory network](https://ory.sh) in NestJS and Angular apps for authentication and authorization flows
- how to setup Ory in local and remote working environments
- how to use [RabbitMQ](https://www.rabbitmq.com) with NestJS
- how to define/validate environment variables
- how to containerize Nx apps with [Docker](https://www.docker.com)
- how to integrate Nx into a [Kubernetes](https://kubernetes.io) workflow
- how to dynamically rebuild Docker images based on Nx dependencies graph

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

## Models

```mermaid
classDiagram
direction RL
class User {
    <<interface>>
    +id : int
    +email : string
    -password : string
}

class Ticket {
    <<interface>>
    +id : string
    +title : string
    +price : float
    +version : int
    +userId : User
    +orderId ?: Order
}

class Order {
    <<interface>>
    +id : string
    +title : string
    +status : OrderStatus
    +version : int
    +ticketId : Ticket
    +userId : User
}

class OrderStatus{
    <<enumeration>>
    Created
    Cancelled
    Complete
    AwaitingPayment
}

class Payment {
    <<interface>>
    +id : string
    +orderId : string
    +stripeId : OrderStatus
    +version : int
}

User "1" --> "*" Ticket
User "1" --> "*" Order
Ticket "1" --> "1" Order
Order ..> OrderStatus
Payment "1" --> "1" Order

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

## Useful commands

... to run after configuring the required environment variables

```bash
# build custom Nginx Proxy
yarn docker:nginx:build

# build custom RabbitMQ node
yarn docker:rmq:build

# start the docker images (mongo, redis, rabbitmq)
yarn docker:deps:up

# start Nginx Proxy
yarn docker:proxy:up

# start backend services
yarn start:backend

# start (Angular) frontend app
yarn start:frontend:local

```
