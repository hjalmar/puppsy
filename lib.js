const state = Object.freeze({'noop': 1, 'waitforready': 2, 'ready': 3});

const puppsy = new class Puppsy{
  constructor(){
    this.__init = false;
    this.__ready = false;
    this.__serverside = false;
    this.__endpoints = new Map();
    this.__firstLoad = new Map();
    this.__state = state.noop;
    this.__status = 0;

    this.__marked(state.noop);

    // look for json comment data
    const ssr = document.documentElement.lastChild;
    if(ssr.nodeType == 8){
      this.__serverside = true;
      const { status, data } = JSON.parse(ssr.textContent);
      this.__status = status;
      if(data){
        data.map(data => this.update(data.key, data.data));
      }
      ssr.remove();
    }else{
      this.__comment = document.documentElement.appendChild(document.createComment(JSON.stringify({status: 1})));
    }
    // remove old dom
    while(document.body.firstChild){document.body.firstChild.remove();}
  }
  init(component, ...props){
    this.__init = true;
    // if we are passing a component, initialize it
    if(component){
      return new component(...props);
    }
  }
  __marked(state = 1){
    this.__state = state;
    document.body.dataset.puppsystate = state;
  }
  __addComment(data = ''){
    data = JSON.stringify({status: 1, data});
    const element = document.createComment(data);
    return document.documentElement.replaceChild(element, this.__comment);
  }
  async ready(fn){
    // make sure we initialize init from our main script
    if(!this.__init){
      throw new Error('puppsy is not initialized!');
    }
    // if we already have loaded the page on the server no need to do anything more
    // since we only care about first load
    if(this.__ready || this.__serverside){
      return;
    };
    // set the ready flag
    this.__ready = true;

    // we need to know if all is settled even rejected promises.
    let all = await Promise.allSettled([...this.__endpoints.entries()].map(async ([_, data]) => {
      const { key, promise, persistent } = data;
      return { key, data: await promise, persistent };
    }));
    // only run if we don't have a status
    if(!this.__status){
      this.__addComment(all.filter(item => item.status == 'fulfilled').map(item => item.value));
      this.__marked(state.ready);
      if(typeof fn == 'function'){
        fn.call(null);
      }
    }
  }
  exists(key){
    return this.__endpoints.has(key);
  }
  // update endpoint
  update(key, value){
    if(!this.__endpoints.has(key) && this.__firstLoad.has(key)){
      throw new Error(`Unable to update non-existing promise with key '${key}'`);
    }
    const ref = this.__endpoints.get(key);
    if(!this.__serverside){
      this.__firstLoad.set(key, true);
    }
    this.__endpoints.set(key, {...ref, promise: new Promise((resolve) => resolve(value))});
    return this.__endpoints.get(key).promise;
  }
  persist(key, fn){
    return this.__bind(key, fn, true);
  }
  promise(key, fn){
    return this.__bind(key, fn, false);
  }
  // handle promises
  __bind(key, fn, persistent){
    if(typeof key != 'string'){
      throw new Error(`Invalid 'key' argument. Expecting 'String'`);
    }
    if(typeof fn != 'function'){
      throw new Error(`Invalid puppsy 'promise' callback argument. Expecting 'Function'`);
    }
    if(typeof persistent != 'boolean'){
      throw new Error(`Invalid persistent argument. Expecting 'Boolean'`);
    }
    
    
    // if data should be persistent
    if(persistent){
      // data exists
      if(this.__endpoints.has(key)){
        if(!this.__firstLoad.has(key)){
          this.__firstLoad.set(key, true);
        }
        return this.__endpoints.get(key).promise;
      }
      // else
    }else{
      // data exists
      if(this.__serverside){
        if(!this.__firstLoad.has(key)){
          this.__firstLoad.set(key, true);
          if(this.__endpoints.has(key)){
            return this.__endpoints.get(key).promise;
          }
        }
      }
    }
    
    this.__marked(state.waitforready);
    return this.__endpoints.set(key, {key, persistent, promise: new Promise(fn)}).get(key).promise;
  }
}

// exports
const init = puppsy.init.bind(puppsy);
const promise = puppsy.promise.bind(puppsy);
const persist = puppsy.persist.bind(puppsy);
const update = puppsy.update.bind(puppsy);

export default puppsy;
export { init, promise, persist, update };