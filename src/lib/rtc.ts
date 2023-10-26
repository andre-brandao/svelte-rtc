/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { writable } from 'svelte/store';

interface Room {
	peerConnection: RTCPeerConnection | undefined;
	localStream: MediaStream | undefined;
	remoteStream: MediaStream | undefined;
	roomId: string | '';
}

export const roomStore = createRoomStore();

const configuration = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
		}
	],
	iceCandidatePoolSize: 10
};

function createRoomStore() {
	const { subscribe, set, update } = writable<Room>({
		peerConnection: undefined,
		localStream: undefined,
		remoteStream: undefined,
		roomId: ''
	});

	async function openUserMedia() {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
		update((room) => {
			room.localStream = stream;
			room.remoteStream = new MediaStream();
			return room;
		});
	}

	async function createRoom() {
		const roomCollection = collection(firestore, 'rooms');
		const roomDoc = doc(roomCollection);

		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});

		console.log('Create PeerConnection with configuration: ', configuration);
		// new
		const peerConnection = new RTCPeerConnection(configuration);

		// registerPeerConnectionListeners();
		peerConnection.addEventListener('icegatheringstatechange', () => {
			console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
		});

		peerConnection.addEventListener('connectionstatechange', () => {
			console.log(`Connection state change: ${peerConnection.connectionState}`);
		});

		peerConnection.addEventListener('signalingstatechange', () => {
			console.log(`Signaling state change: ${peerConnection.signalingState}`);
		});

		peerConnection.addEventListener('iceconnectionstatechange ', () => {
			console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
		});
		// end

		// new
		const localStream = stream;
		localStream.getTracks().forEach((track) => {
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
		// new
		const roomId = roomDoc.id;
		console.log('-------------------------------------');
		console.log(`New room created with SDP offer. Room ID: ${roomDoc.id}`);

		const remoteStream = new MediaStream();

		peerConnection.addEventListener('track', (event) => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach((track) => {
				console.log('Add a track to the remoteStream:', track);
				remoteStream.addTrack(track);
			});
		});

		// Listening for remote session description below
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const unsub = onSnapshot(roomDoc, async (snapshot) => {
			const data = snapshot.data();
			if (!peerConnection.currentRemoteDescription && data && data.answer) {
				console.log('Got remote description: ', data.answer);
				const rtcSessionDescription = new RTCSessionDescription(data.answer);

				await peerConnection.setRemoteDescription(rtcSessionDescription);
			}
		});

		// Listen for remote ICE candidates below
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const unsub2 = onSnapshot(collection(roomDoc, 'calleeCandidates'), (snapshot) => {
			snapshot.docChanges().forEach(async (change) => {
				if (change.type === 'added') {
					const data = change.doc.data();
					console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
					await peerConnection.addIceCandidate(new RTCIceCandidate(data));
				}
			});
		});

		update(() => {
			return {
				peerConnection,
				localStream,
				remoteStream,
				roomId
			};
		});
	}

	async function joinRoom(roomId: string) {
		console.log('Join room: ', roomId);
		if (!roomId) {
			return;
		}
		const roomCollection = collection(firestore, 'rooms');
		const roomDoc = doc(roomCollection, roomId);
		const roomSnapshot = await getDoc(roomDoc);

		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: true
		});
		const localStream = stream;

		console.log('Got room:', roomSnapshot.exists);

		if (roomSnapshot.exists()) {
			console.log('Create PeerConnection with configuration: ', configuration);
			const peerConnection = new RTCPeerConnection(configuration);

			// 		//start
			// 		// registerPeerConnectionListeners();

			peerConnection.addEventListener('icegatheringstatechange', () => {
				console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
			});

			peerConnection.addEventListener('connectionstatechange', () => {
				console.log(`Connection state change: ${peerConnection.connectionState}`);
			});

			peerConnection.addEventListener('signalingstatechange', () => {
				console.log(`Signaling state change: ${peerConnection.signalingState}`);
			});

			peerConnection.addEventListener('iceconnectionstatechange ', () => {
				console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`);
			});
			// 		//end
			localStream.getTracks().forEach((track) => {
				peerConnection.addTrack(track, localStream);
			});

			// Code for collecting ICE candidates below
			const calleeCandidatesCollection = collection(roomDoc, 'calleeCandidates');

			peerConnection.addEventListener('icecandidate', (event) => {
				if (!event.candidate) {
					console.log('Got final candidate!');
					return;
				}
				console.log('Got candidate: ', event.candidate);
				// calleeCandidatesCollection.add(event.candidate.toJSON());
				addDoc(calleeCandidatesCollection, event.candidate.toJSON());
			});

            const remoteStream = new MediaStream();

			peerConnection.addEventListener('track', (event) => {
				console.log('Got remote track:', event.streams[0]);
				event.streams[0].getTracks().forEach((track) => {
					console.log('Add a track to the remoteStream:', track);

					remoteStream.addTrack(track);
				});
			});

			// Code for creating SDP answer below

			const offer = roomSnapshot.data().offer;
			console.log('Got offer:', offer);

			await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

			const answer = await peerConnection.createAnswer();
			console.log('Created answer:', answer);

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
						const data = change.doc.data();
						console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);

						await peerConnection.addIceCandidate(new RTCIceCandidate(data));
					}
				});
			});


            update(() => {
                return {
                    peerConnection,
                    localStream,
                    remoteStream,
                    roomId
                };
            });
		}
	}


	return {
		subscribe,
		createRoom,
		openUserMedia,
        joinRoom
	};
}
