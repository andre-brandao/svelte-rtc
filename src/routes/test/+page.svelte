<script lang="js">
	import Video from '$lib/Video.svelte';
	import { roomStore } from '$lib/rtc';
	import { onMount } from 'svelte';

	onMount(async () => {
		roomStore.openUserMedia();
	});

	let idInput = '';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<div>
	<!-- <button class="btn variant-filled-primary" on:click={$roomStore}>Open camera</button> -->

	<!-- <button> Join room</button> -->

	<!-- <button class="btn variant-filled-primary" on:click={hangUp}>Hangup</button> -->
</div>

<div class="text-center font-bold text-5xl">
	<button class="btn variant-filled-primary" on:click={roomStore.createRoom}>Create room</button>
	<p>
		Current room is {$roomStore.roomId}
	</p>
</div>

<div class="flex justify-center gap-4">
	<div class="text-center font-bold bg-primary-500">
		<Video bind:src={$roomStore.localStream} muted={true} />
		<p>You</p>
	</div>
	<div class="text-center font-bold bg-secondary-500">
		<Video bind:src={$roomStore.remoteStream} />
		<p>Outro</p>
	</div>
</div>

<div class="flex justify-center pt-5">
	<input type="text" class="rounded-md p-2" bind:value={idInput} />
	<button
		class="btn variant-filled-primary"
		on:click={() => {
			roomStore.joinRoom(idInput);
		}}>join</button
	>
</div>
