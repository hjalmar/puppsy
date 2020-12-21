import App from './App.svelte';
import puppsy from 'puppsy';

// initialize puppsy before bootstrapping the application
puppsy.init();

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;