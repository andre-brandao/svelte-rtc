<script lang="js">
		import {
		addDoc,
		collection,
		deleteDoc,
		doc,
		getDoc,
		getDocs,
		onSnapshot,
		setDoc,
		updateDoc
	} from 'firebase/firestore';
	import { firestore } from '$lib/firebase';
	import { onMount } from 'svelte';
	
	import Video from '$lib/Video.svelte';

	import { roomStore } from '$lib/rtc';

	
	const configuration = {
		iceServers: [
			{
				urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
			}
		],
		iceCandidatePoolSize: 10
	};

	onMount(async () => {
		openUserMedia();
		// const stream = await navigator.mediaDevices.getUserMedia({
		// 	video: true,
		// 	audio: true
		// });

		// localStream = stream;
		// remoteStream = new MediaStream();
	});

	/**
	 * @type {RTCPeerConnection | null}
	 */
	let peerConnection = null;
	/**
	 * @type {MediaStream | null}
	 */
	let localStream = null;
	/**
	 * @type {MediaStream | null}
	 */
	let remoteStream = null;
	/**
	 * @type {string | null}
	 */
	let roomId = null;

	/**
	 * @type {HTMLVideoElement}
	 */
	let localVideo;
	/**
	 * @type {HTMLVideoElement}
	 */
	let remoteVideo;

	async function createRoom() {
		const roomCollection = collection(firestore, 'rooms');
		const roomDoc = doc(roomCollection);

		console.log('Create PeerConnection with configuration: ', configuration);
		peerConnection = new RTCPeerConnection(configuration);

		registerPeerConnectionListeners();

		//@ts-ignore
		localStream.getTracks().forEach((track) => {
			//@ts-ignore
			peerConnection.addTrack(track, localStream);
		});

		const callerCandidatesCollection = collection(roomDoc, 'callerCandidates');

		peerConnection.addEventListener('icecandidate', (event) => {
			if (!event.candidate) {
				console.log('Got final candidate!');
				return;
			}
			console.log('Got candidate: ', event.candidate);
			// callerCandidatesCollection.add(event.candidate.toJSON());
			addDoc(callerCandidatesCollection, event.candidate.toJSON());
		});

		// Code for collecting ICE candidates above

		// Code for creating a room below
		const offer = await peerConnection.createOffer();
		await peerConnection.setLocalDescription(offer);
		console.log('Created offer:', offer);
		const roomWithOffer = {
			offer: {
				type: offer.type,
				sdp: offer.sdp
			}
		};
		// await roomRef.set(roomWithOffer);
		await setDoc(roomDoc, roomWithOffer);
		roomId = roomDoc.id;
		console.log('-------------------------------------');
		console.log(`New room created with SDP offer. Room ID: ${roomDoc.id}`);

		peerConnection.addEventListener('track', (event) => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach((track) => {
				console.log('Add a track to the remoteStream:', track);
				//@ts-ignore
				remoteStream.addTrack(track);
			});
		});

		// Listening for remote session description below
		const unsub = onSnapshot(roomDoc, async (snapshot) => {
			const data = snapshot.data();
			// @ts-ignore
			if (!peerConnection.currentRemoteDescription && data && data.answer) {
				console.log('Got remote description: ', data.answer);
				const rtcSessionDescription = new RTCSessionDescription(data.answer);
				// @ts-ignore

				await peerConnection.setRemoteDescription(rtcSessionDescription);
			}
		});

		// Listen for remote ICE candidates below
		const unsub2 = onSnapshot(collection(roomDoc, 'calleeCandidates'), (snapshot) => {
			snapshot.docChanges().forEach(async (change) => {
				if (change.type === 'added') {
					let data = change.doc.data();
					console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
					// @ts-ignore
					await peerConnection.addIceCandidate(new RTCIceCandidate(data));
				}
			});
		});
	}

	async function joinRoom() {
		console.log('Join room: ', roomId);
		if (!roomId) {
			return;
		}
		const roomCollection = collection(firestore, 'rooms');
		const roomDoc = doc(roomCollection, roomId);
		const roomSnapshot = await getDoc(roomDoc);
		console.log('Got room:', roomSnapshot.exists);

		if (roomSnapshot.exists()) {
			console.log('Create PeerConnection with configuration: ', configuration);
			peerConnection = new RTCPeerConnection(configuration);
			registerPeerConnectionListeners();
			//@ts-ignore
			localStream.getTracks().forEach((track) => {
				//@ts-ignore
				peerConnection.addTrack(track, localStream);
			});
		}

		// Code for collecting ICE candidates below
		const calleeCandidatesCollection = collection(roomDoc, 'calleeCandidates');
		// @ts-ignore
		peerConnection.addEventListener('icecandidate', (event) => {
			if (!event.candidate) {
				console.log('Got final candidate!');
				return;
			}
			console.log('Got candidate: ', event.candidate);
			// calleeCandidatesCollection.add(event.candidate.toJSON());
			addDoc(calleeCandidatesCollection, event.candidate.toJSON());
		});

		//@ts-ignore
		peerConnection.addEventListener('track', (event) => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach((track) => {
				console.log('Add a track to the remoteStream:', track);
				//@ts-ignore
				remoteStream.addTrack(track);
			});
		});

		// Code for creating SDP answer below
		// @ts-ignore
		const offer = roomSnapshot.data().offer;
		console.log('Got offer:', offer);
		// @ts-ignore
		await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
		// @ts-ignore
		const answer = await peerConnection.createAnswer();
		console.log('Created answer:', answer);
		// @ts-ignore
		await peerConnection.setLocalDescription(answer);
		const roomWithAnswer = {
			answer: {
				type: answer.type,
				sdp: answer.sdp
			}
		};

		await updateDoc(roomDoc, roomWithAnswer);

		// Listening for remote ICE candidates below
		onSnapshot(collection(roomDoc, 'callerCandidates'), (snapshot) => {
			snapshot.docChanges().forEach(async (change) => {
				if (change.type === 'added') {
					let data = change.doc.data();
					console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
					// @ts-ignore
					await peerConnection.addIceCandidate(new RTCIceCandidate(data));
				}
			});
		});
	}

	async function hangUp() {
		//@ts-ignore
		const tracks = document.querySelector('#localVideo').srcObject.getTracks();
		tracks.forEach((/** @type {{ stop: () => void; }} */ track) => {
			track.stop();
		});

		if (remoteStream) {
			remoteStream.getTracks().forEach((track) => track.stop());
		}

		if (peerConnection) {
			peerConnection.close();
		}

		if (roomId) {
			const roomCollection = collection(firestore, 'rooms');
			const roomDoc = doc(roomCollection, roomId);
			const calleRef = collection(roomDoc, 'calleeCandidates');
			const calleeCandidates = await getDocs(calleRef);
			calleeCandidates.forEach(async (candidate) => {
				await deleteDoc(candidate.ref);
			});

			await deleteDoc(roomDoc);
		}

		document.location.reload();
	}

	function registerPeerConnectionListeners() {
		if (peerConnection == null) {
			return;
		}
		peerConnection.addEventListener('icegatheringstatechange', () => {
			// @ts-ignore
			console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
		});

		peerConnection.addEventListener('connectionstatechange', () => {
			// @ts-ignore
			console.log(`Connection state change: ${peerConnection.connectionState}`);
		});

		peerConnection.addEventListener('signalingstatechange', () => {
			// @ts-ignore
			console.log(`Signaling state change: ${peerConnection.signalingState}`);
		});

		peerConnection.addEventListener('iceconnectionstatechange ', () => {
			// @ts-ignore
			console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
		});
	}

	async function openUserMedia() {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
		localVideo.srcObject = stream;
		localStream = stream;

		remoteStream = new MediaStream();
		remoteVideo.srcObject = remoteStream;

		console.log('Stream:', localVideo.srcObject);
	}
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<div>
	<button class="btn variant-filled-primary" on:click={openUserMedia}>Open camera</button>

	<button class="btn variant-filled-primary" on:click={createRoom}>Create room</button>

	<!-- <button> Join room</button> -->

	<button class="btn variant-filled-primary" on:click={hangUp}>Hangup</button>
</div>

<div>
	Current room is {roomId}
</div>

<div class="videos">
	
	<Video bind:src={$roomStore.localStream} muted={true} />
	<Video bind:src={$roomStore.remoteStream} />
</div>

<div>
	<input type="room-id" bind:value={roomId} />
	<button class="btn variant-filled-primary" on:click={joinRoom}>join</button>
</div>

