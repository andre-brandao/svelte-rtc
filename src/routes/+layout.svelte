<script>
	// import { toastStore } from '$lib/stores';
	import '../app.postcss';
	import { AppBar, Toast } from '@skeletonlabs/skeleton';
	import { Tv } from 'lucide-svelte';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	// initializeToastStore();
</script>

<Toast />
<AppBar>
	<svelte:fragment slot="lead">
		<a href="/">
			<Tv />
		</a>
	</svelte:fragment>
	<svelte:fragment slot="trail">(action)</svelte:fragment>
	<svelte:fragment slot="headline">Fake Meet</svelte:fragment>
</AppBar>

<slot />
