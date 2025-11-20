<script>
	import favicon from '$lib/assets/favicon.ico';
	import '../app.css';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<slot />
