<script lang="js">
	import { page } from '$app/stores';
	import Video from '$lib/Video.svelte';
	import { roomStore } from '$lib/rtc';
	import { onMount } from 'svelte';

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
<div class="text-center">
	clique para Copiar:
	<p use:clickToCopy>{$page.url + '/' + $roomStore.roomId}</p>
</div>
