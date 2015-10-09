# :cactus: gooey.http

> HTTP client-server synchronization module for Gooey

`gooey.http` is a module containing several HTTP-based APIs that leverage Gooey's state synchronization mechanism.

# Problem

Read about the [challenges of synchronizing state in SPAs how Gooey tries to address it](https://github.com/slurmulon/gooey#concrete).

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

A tiny chainable interface for performing HTTP transactions.

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

Integrates with Gooey's PubSub mechanism to help synchronize states between the Restful API and its clients. 

## Hypermedia

`gooey.http.hyper`

Wraps `gooey.http.rest` with a robust interface for modelng Restful Hypermedia APIs.

Specifications:

- Siren
- HAL
- Collection+JSON
