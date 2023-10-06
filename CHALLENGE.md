# Backend challenge

## Goal

In the ticketing app, we want to add a new functionality that would allow to moderate tickets before publishing them.
In other words, the tickets should only become public | visible once they have been validated.

### User story

`As an administrator, I want to ensure that a ticket does not contain illegal content before it’s published.`

### Flow

```mermaid
%%{init: {'theme':'base'}}%%
flowchart TD
    start([A user creates a new ticket offer])
    create[[Create the ticket]]
    moderate[/Wait for admin moderation/]
    moderation{Is this ticket<br>allowed ?}
    accept[[Accept the ticket]]
    display[\Display the ticket publicly\]
    notify[\Notify the user\]
    ending([End])
    refuse[[Delete the ticket]]
%%
    start --> create
    create --> moderate
    moderate --> moderation
    moderation --yes--> accept
    moderation --no--> refuse
    refuse --> notify
    notify --> ending
    accept --> display
    display --> ending


```

```mermaid
%%{wrap}%%
%%{init: {'theme':'base'}}%%
flowchart TD
    start([An admin moderated a ticket])
    update[Set the ticket status]
    sync[Synchronize services]
    db[(tickets store)]
    ending([End])
    start --> update
    update --> db
    db --> sync
    sync --> ending

```

* * *
