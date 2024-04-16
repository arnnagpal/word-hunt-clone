<script lang="ts">
import Game from "$lib/Game.svelte";
import type { PageData } from './$types';

export let data: PageData;
</script>

<svelte:head>
	<title>In Game</title>
	<meta name="description" content="Word Hunt - Maddie ❣️" />
</svelte:head>

<div class="overflow-y-hidden">
	<Game board={data.board}/>
</div>

