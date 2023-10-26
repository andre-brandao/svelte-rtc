<script>
	import { onMount } from 'svelte';

	export let muted = false;

	/**
	 * @type {HTMLVideoElement}
	 */
	let videoElement;

	/**
	 * @type {MediaProvider | undefined}
	 */
	export let src;

	$: {
		if (src) {
			videoElement.srcObject = src;
		}
	}

	let loading = true;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video
	bind:this={videoElement}
	class="m-2 block h-[480px] w-[640px] bg-slate-500"
	autoplay
	playsinline
	{muted}
/>
