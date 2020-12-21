<script>
  import { onMount } from 'svelte';
  import puppsy from 'puppsy';
  import RouterComponent, { context } from 'svelte-standalone-router';

  // pages
  import Index from './pages/Index.svelte';
  import Subpage from './pages/Subpage.svelte';

  const app = context({ initial: location.pathname });
  app.get('/', (req, res) => res.send(Index));
  app.get('/:subpage', (req, res) => res.send(Subpage));

  onMount(() => {
    puppsy.ready(() => {
      console.log('We are now ready to preload.');
    });
  });
</script>

<RouterComponent />