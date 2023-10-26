<script lang="js">
	import Video from '$lib/Video.svelte';
	import { roomStore } from '$lib/rtc';
	import { onMount } from 'svelte';


    onMount(async () => {
        roomStore.openUserMedia();
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

    let idInput = ''
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<div>
	<!-- <button class="btn variant-filled-primary" on:click={$roomStore}>Open camera</button> -->

	<button class="btn variant-filled-primary" on:click={roomStore.createRoom}>Create room</button>

	<!-- <button> Join room</button> -->

	<!-- <button class="btn variant-filled-primary" on:click={hangUp}>Hangup</button> -->
</div>

<div>
	Current room is {$roomStore.roomId}
</div>

<div class="videos">
	<Video bind:videoSource={localVideo} muted={true} />
	<Video bind:videoSource={remoteVideo} />
</div>

<div>
	<input type="room-id" bind:value={idInput} />
	<button
		class="btn variant-filled-primary"
		on:click={() => {
			roomStore.joinRoom(idInput);
		}}>join</button
	>
</div>
