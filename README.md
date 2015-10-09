# :cactus: gooey.http

> HTTP client-server synchronization module for Gooey

`gooey.http` is a module containing several HTTP-based APIs that leverage Gooey's data synchronization mechanism.

# Rationale

HTTP is a stateless protocol and clients of HTTP services are inherently stateful. 
Clients manage their state by caching HTTP resource entities, only updating their versions of entity and sub-entity states when caches are considered stale.

The state caching mechanisms of SPAs are generally difficult to architect and maintain: clients model and interact with granular HTTP resource entities (good),
but each of these entities (and their sub-entities) have a state to maintain that are naturally complicated by this stateless/stateful conflict (bad).
The impact of this conflict scales proportionatily to the number of resource entities / sub-entities, and is invevitably toxic to design sustainability.

Although this issue is prevalant in SPAs, the mechanism driving the problem is abstract and can be observed in many different types of web applications.

Read more on [how Gooey identifies and addresses the core problem](https://github.com/slurmulon/gooey#concrete).

# Install

1. gooey (core module)

  > $ git clone git@github.com:slurmulon/gooey.git

  > $ cd gooey

  > $ npm link

2. gooey-http

  > $ git clone git@github.com:slurmulon/gooey-http.git

  > $ cd gooey-http

  > $ npm link gooey

  > $ npm install

# Interfaces

## HTTP

`gooey.http`

A tiny chainable interface for performing HTTP transactions

```
const login = (username, password) => {
  return new http.Request('POST', 'http://127.0.0.1/token')
    .body({username, password})
    .header('cache-control', 'no-cache')
    .send()
    .then(token => {
      User.byToken(token).then(user => user.select())
    })
    .catch(err => {
      if (err.status === 401) {
        Notify.error('Invalid credentials, please try again')
      } else {
        Notify.error('Unknown error, please try again later')
      }
    })
})
```

## REST

`gooey.http.rest`

Wraps `gooey.http` with a pragmatic interface for modeling Restful Web API resources.

## Hypermedia

`gooey.http.hyper`

Wraps `gooey.http.rest` with a robust interface for modelng Restful Hypermedia APIs.

Specifications:

- Siren
- HAL
- Collection+JSON
