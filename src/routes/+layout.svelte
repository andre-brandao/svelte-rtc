<script>
	import '../app.postcss';
	import { AppBar } from '@skeletonlabs/skeleton';
	import { Tv } from 'lucide-svelte';
</script>

<AppBar>
	<svelte:fragment slot="lead">
		<Tv />
	</svelte:fragment>
	<svelte:fragment slot="trail">(actions)</svelte:fragment>
	<svelte:fragment slot="headline">Fake Meet</svelte:fragment>
</AppBar>

<slot />
