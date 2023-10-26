<script>
	import { onMount } from 'svelte';


	export let muted = false;

	/**
	 * @type {HTMLVideoElement}
	 */
	export let videoSource;

	let loading = true;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={videoSource} class="m-2 block h-[480px] w-[640px] bg-slate-500" autoplay playsinline {muted} />
