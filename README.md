# Puppsy
Svelte serverside rendering.
```
npm i -D puppsy
```

## What is puppsy?
While puppsy is pure javascript and more or less only a wrapper around promises it can be used in any javascript project. It's existence is however purely related to enable serverside rendering in Svelte applications.

The goal is to quickly turn a frontend application and enable it to be serverside rendered.

### Implementation 
```
init : Function 
promise : Function(uniqueKey : String, promiseFunction(resolve, reject) : Function) -> Promise;
persist : Function(uniqueKey : String, promiseFunction(resolve, reject) : Function) -> Promise;
update : Function(uniqueKey : String, value : Any) : Promise;
ready : Function(callback : Function) : void;
```

## Initialize
Make sure to initialize before bootstrapping your application
```js
import puppsy from 'puppsy';
puppsy.init();
```

## promises
puppsy is built around promises. Create a promise by providing a unique key and the promise callback function.

```js
// dynamic request, will execute promise on every occurence
puppsy.promise(uniqueKey : String, promiseFunction(resolve, reject) : Function) : Promise;
// Keep data static after initial load and will not be called again unless forced update of value with the update method
puppsy.persist(uniqueKey : String, promiseFunction(resolve, reject) : Function) : Promise;
// update value for key
puppsy.update(uniqueKey : String, value : Any) : Promise;
```

```js
import puppsy from 'puppsy';

// simulate a request with some delay
const numbers = puppsy.promise('numbers', async (resolve, reject) => {
  setTimeout(() => {
    resolve([1,2,3,4,5,6,7]);
  }, 3000);
});
```

## When to call ready
Since it's impossible to know when to start preloading we have to manually do so by calling `puppsy.ready()`.
```js
  // call ready after all puppsy promises
  puppsy.ready(() => {
    // callback function for when the preloading is finished
    console.log('Server has preloaded the data!');
  });
```

## Starter template
```
// clone the starter template
npx degit hjalmar/puppsy/template <template>
```

Install the frontend and launch it as any other svelte app during development. Don't forget to build before hosting. It's perfectly fine to run both dev servers during development so the only thing you have to do to validate the server served app is to refresh the page. An error for the liveserver will occur which you can ignore since it's not injected after build. 
```
// install frontend
cd <template>/frontend
npm install
npm run dev
```

The server is configured out of the box with the current locations and settings.
```
// install server
cd <template>/server
npm install
npm run dev
```

Running the dev script enables some logging of the request which is turned of from the start script. To serve the host settings run the start script.
```
npm run start
```