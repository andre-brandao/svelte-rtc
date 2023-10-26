<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	let idInput = '';
</script>

<main>
	<input type="text" bind:value={idInput} />
	<a href={$page.url + '/' + idInput}>Entrar sala</a>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}
	input {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 5px;
	}
	a {
		padding: 5px;
		border: 1px solid #ccc;
		border-radius: 4px;
		text-decoration: none;
	}
</style>
