<script lang="js">
	import Video from '$lib/Video.svelte';
	import { roomStore } from '$lib/rtc';
	import { onMount } from 'svelte';

	export let data;

	onMount(async () => {
		// await roomStore.openUserMedia();
		// await roomStore.createRoom();
		await roomStore.joinRoom(data.roomID);
	});
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
