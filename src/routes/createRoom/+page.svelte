<script lang="js">
	import { page } from '$app/stores';
	import Video from '$lib/Video.svelte';
	import { roomStore } from '$lib/rtc';
	import { onMount } from 'svelte';
	import { clipboard, getToastStore } from '@skeletonlabs/skeleton';
	// import { toastStore } from '$lib/stores';
	const toastStore = getToastStore();

	onMount(async () => {
		await roomStore.createRoom();
	});

	//@ts-ignore
	function clickToCopy(node, target) {
		async function copyText() {
			//@ts-ignore
			let text = target ? document.querySelector(target).innerText : node.innerText;

			try {
				await navigator.clipboard.writeText(text);

				node.dispatchEvent(
					new CustomEvent('copysuccess', {
						bubbles: true
					})
				);
			} catch (error) {
				node.dispatchEvent(
					new CustomEvent('copyerror', {
						bubbles: true,
						detail: error
					})
				);
			}
		}

		node.addEventListener('click', copyText);

		return {
			destroy() {
				node.removeEventListener('click', copyText);
			}
		};
	}

	function getUrl() {
		//return root page url + /joinRoom + / + roomId
		// return $page.url + '/' + $roomStore.roomId;
		return $page.url.toString().replace($page.route.id ?? '', '/joinRoom/');
	}
</script>

<div class="text-center font-bold text-5xl">
	<!-- <button class="btn variant-filled-primary" on:click={roomStore.createRoom}>Create room</button> -->
	<p>
		Current room is {$roomStore.roomId}
	</p>
</div>

<div class="flex flex-wrap justify-center gap-4">
	<div class="text-center font-bold bg-primary-500">
		<Video bind:src={$roomStore.localStream} muted={true} />
		<p>You</p>
	</div>
	<div class="text-center font-bold bg-secondary-500">
		<Video bind:src={$roomStore.remoteStream} />
		<p>Outro</p>
	</div>
</div>
<div class="text-center p-5">
	<button
		class="btn bg-warning-500 p-4 cursor-pointer"
		on:click={() =>
			toastStore.trigger({ message: 'Copied to clipboard', hideDismiss: true, timeout: 1000 })}
		use:clipboard={getUrl() + $roomStore.roomId}>Copy Room Link</button
	>
</div>
