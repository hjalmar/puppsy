<script>
  import puppsy from 'puppsy';

  // promise callback
  const fn = (resolve, reject) => {
    // setTimeout(() => {
    //   resolve(Math.floor(Math.random() * 100));
    // }, 2000);
    resolve(Math.floor(Math.random() * 100));
  };

  // dynamic data
  const dynamic = puppsy.promise('dynamic', fn);

  // persistant data
  const persistent = puppsy.persist('persistent', fn);
</script>

<h2>Dynamic</h2>
{#await dynamic}
  Preloading...
{:then result}
  Preloading done : {result}
{/await}

<h2>Persistent</h2>
{#await persistent}
  Preloading...
{:then result}
  Preloading done : {result}
{/await}