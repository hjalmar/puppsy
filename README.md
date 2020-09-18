# NOTE: Early stage, proof of concept!
Puppsy is currently a proof of concept. Be responsible and use more established methods of serverside rendering for your commercial applications.

# Puppsy
Svelte serverside rendering as a microservice.
```
npm i -D puppsy
```


## What is puppsy? 
Puppsy is a promise based, serverside rendered, microservice that utilises googles puppeteer. The intention is to have a proxy server on top off the dynamic javascript application for that serverside rendered initial request.

This means that you can take your svelte project and quickly turn it into a serverside rendered application without much extra work. 


## Initialize
```js
import App from './App.svelte';
import { Init } from 'puppsy';

// notice how we don't initialize a new 'App' instance here
const app = Init(App, {
  target: document.body
});

export default app;
```

## promises

puppsy is built around promises. Create a promise by providing a unique key and the promise callback function.

```js
puppsy.promise(uniqueKey : String, promiseFunction(resolve, reject) : Function);
```

Keep data static after initial load.
```js
puppsy.static(uniqueKey : String, promiseFunction(resolve, reject) : Function);
```

```js
import puppsy from 'puppsy';
// todo list
let todos = [];
// promise function
const fetchInitTodos = async (resolve, reject) => {
  try{
    // resolve array of fetch requests
    resolve([
      // fetch 3 todo items from placholder api
      await fetchData(),
      await fetchData(),
      await fetchData(),
    ]);
  }catch(error){
    // or reject it on error
    reject({error: 'There was an error while performing a fetch request.'});
  }
};
puppsy.promise('todos', fetchInitTodos)
  .then(data => {
    todos = [...todos, ...data];
  })
  .catch(error => {
    // do something with the error
    console.warn(error);
  });
```

Since it's impossible to know when to start preloading we have to manually do so by calling `puppsy.ready()`
```js
  // call ready after all puppsy promises
  puppsy.ready(() => {
    // callback function for when the preloading is finished
    console.log('Server has preloaded the data!');
  });
```

Since puppsy.promise is a __Promise__ you can use it with sveltes await syntax.
```js
<script>
  import puppsy from 'puppsy';
  // since puppsy.promise is a promise we can assign it to a variable
  // and use sveltes built-in await syntax
  const promise = puppsy.promise('test', (resolve, reject) => {
    resolve('puppsy.promise has been resolved!');
  });

  // call ready after all puppsy promises
  puppsy.ready(() => {
    // callback function for when the preloading is finished
    console.log('Server has preloaded the data!');
  });
</script>

<div>
  <p>
    {#await promise}
      loading...
    {:then result}
      {result}
    {/await}
  </p>
</div>
```

## When should i call puppsy.ready()?
Refrain from calling ready in child components. The first occurence of ready will start the preloading and any promise after that would not be included. If you have a navigation structure like `home`, `work`, `about`, `contact`, these would be good topmost places to call ready from.

