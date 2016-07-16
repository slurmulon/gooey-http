# gooey.http

> :cactus: HTTP client-server synchronization module for Gooey

`gooey.http` is a module containing several HTTP-based APIs that leverage Gooey's data synchronization mechanism.

# Problem

Read about the [challenges of synchronizing state in SPAs how Gooey tries to address it](https://github.com/slurmulon/gooey#concrete).

# Install

  > $ git clone git@github.com:slurmulon/gooey-http.git

  > $ cd gooey-http

  > $ npm install

# Interfaces

## HTTP

`gooey.http`

A tiny chainable interface for performing HTTP transactions backed by Gooey data synchronization

```js
const login = (username, password) => {
  return new http.Request('POST', 'http://127.0.0.1/token')
    .header('cache-control', 'no-cache')
    .body({username, password})
    .send()
    .then(token => User.byToken(token))
    .then(user => user.select())
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

Integrates with Gooey's PubSub mechanism to help synchronize data and states between the Restful API and its clients.

The interface also supports easy managent of a resource's current context (i.e. a user's currently selected entities).

The following example performs a `PUT` to `/v1/user/:id/password`, automatically updating
the current resource state and publishing the change to all dependent services:

```js
const user = new http.rest.service({
  base: '/v1/',
  name: 'user',
  model: self => {
    self.changePassword = (oldPass, newPass) => self.put('password', {oldPass, newPass})
  }
})
```
