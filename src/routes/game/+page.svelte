<script lang="ts">
import Game from "$lib/Game.svelte";
import type { PageData } from './$types';

export let data: PageData;
</script>

<svelte:head>
	<title>In Game</title>
	<meta name="description" content="Word Hunt - Maddie ❣️" />
</svelte:head>

<div class="overflow-y-hidden bg-repeat bg-page-game-background bg-cover bg-center h-screen flex flex-col justify-between items-center">
	<div class="flex flex-col items-center h-1/4">
		<div>
			<!--		game header   -->

		</div>
		<div>
			<!--		Timer   -->
		</div>
	</div>

	<div class="flex flex-col justify-center items-center h-3/4">
		<div>
			<Game board={data.board}/>
		</div>
	</div>
</div>

