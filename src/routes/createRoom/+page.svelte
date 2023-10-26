<script lang="js">
	import { page } from '$app/stores';
	import Video from '$lib/Video.svelte';
	import { roomStore } from '$lib/rtc';
	import { onMount } from 'svelte';

	onMount(async () => {
		// await roomStore.openUserMedia();
		await roomStore.createRoom();
	});
	/**
	 * @type {HTMLVideoElement}
	 */
	let localVideo;
	/**
	 * @type {HTMLVideoElement}
	 */
	let remoteVideo;
	$: {
		console.log($roomStore);
		if ($roomStore.localStream && $roomStore.remoteStream) {
			localVideo.srcObject = $roomStore.localStream;
			remoteVideo.srcObject = $roomStore.remoteStream;
		}
	}
	function clickToCopy(node, target) {
		async function copyText() {
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
</script>

<div class="text-center font-bold text-5xl">
	<!-- <button class="btn variant-filled-primary" on:click={roomStore.createRoom}>Create room</button> -->
	<p>
		Current room is {$roomStore.roomId}
	</p>
</div>

<div class="flex justify-center gap-4">
	<div class="text-center font-bold bg-primary-500">
		<Video bind:videoSource={localVideo} muted={true} />
		<p>You</p>
	</div>
	<div class="text-center font-bold bg-secondary-500">
		<Video bind:videoSource={remoteVideo} />
		<p>Outro</p>
	</div>
</div>
<div class="text-center">
	clique para Copiar:
	<p use:clickToCopy>{$page.url + '/' + $roomStore.roomId}Clique to copy</p>
</div>
<!-- create a copy to clipboard button -->
