import puppsy from './main.js';

export default (element, props) => {
  let lastPrefetch = new Map();
  const actionHandler = (e) => {
    const ms = 0;
    const href = e.currentTarget.getAttribute('href');

    if((Date.now() - (lastPrefetch.get(href) || 0)) > ms){
      lastPrefetch.set(href, Date.now());
      // prefetch content
      const options = {
        headers: {
          'Content-Type': 'application/json'
        }
      }
      fetch(href, options).then(_ => _.json()).then((response) => {
        if(Array.isArray(response.data)){
          response.data.forEach(item => {
            puppsy.update(item.key, item.data);
          });
        }
      }).catch((error) => {
        // console.warn(error);
      });
    }
  }
  element.addEventListener('mouseover', actionHandler);
  return {
    update(parameters){},
    destroy(){element.removeEventListener('mouseover', actionHandler);}
  }
}
