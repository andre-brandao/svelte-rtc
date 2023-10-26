import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const roomID = event.params.id;
	return { roomID };
}) satisfies PageServerLoad;
