<script lang="ts">
    import Game from '$lib/Game.svelte';
    import type { PageData } from './$types';
    import GameHeader from '$lib/GameHeader.svelte';
    import { type ScoreEvent, WordSelectionState } from 'ambient';
    import GameScore from '$lib/GameScore.svelte';

    export let data: PageData;

	let score = 0;
	let wordCount = 0;

	let gameDisabled: boolean;

	let selectionStatus = WordSelectionState.NoWord;
	let showScore = false;
	let lastWord = '';
	let lastPoints = 0;

	// eslint-disable-next-line no-undef
	let showScoreInterval: NodeJS.Timeout;

	let animateScore = false;

	function scoreChange(event: CustomEvent<ScoreEvent>) {
		score += event.detail.points;
		wordCount += 1;

		selectionStatus = WordSelectionState.NewWord;
		console.log(`new selection status ${WordSelectionState[selectionStatus]}`);

		lastWord = event.detail.word;
		lastPoints = event.detail.points;
	}

	function selectionEvent(event: CustomEvent<ScoreEvent>) {
		selectionStatus = event.detail.selectionStatus;
		console.log(`new selection status ${WordSelectionState[event.detail.selectionStatus]}`);

		lastWord = event.detail.word;
		lastPoints = event.detail.points;

		animateScore = false;
		showScore = true;
		if (showScoreInterval) clearTimeout(showScoreInterval);
	}

	function endDragEvent() {
		if (showScoreInterval) clearTimeout(showScoreInterval);
		showScore = true;
		animateScore = true;

		showScoreInterval = setTimeout(() => {
			showScore = false;
			animateScore = false;
			lastWord = '';
			lastPoints = 0;
			selectionStatus = WordSelectionState.NoWord;
		}, 500);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function timeOver() {
		console.log('Time Over');
		gameDisabled = true;
	}

</script>

<svelte:head>
	<title>Word Hunt - Maddie ❣️</title>
	<meta content="Word Hunt - Maddie ❣️" name="description" />
</svelte:head>

<div class="flex flex-col justify-between items-center">

	<div class="flex flex-col items-center h-1/4">
		<!--		game header   -->
		<GameHeader bind:score={score} bind:words={wordCount} on:timeup={timeOver} time={90} />
	</div>

	<div class="flex flex-col items-center w-screen h-[15vh] mt-20">
		<!--    game score on top of board -->
		{#if showScore}
			<GameScore bind:animate={animateScore} bind:word={lastWord} bind:points={lastPoints} bind:selectionStatus={selectionStatus} />
		{/if}
	</div>

	<div class="flex flex-col items-center h-[85vh]">
		<div>
			<Game bind:disabled={gameDisabled} board={data.board} on:score={scoreChange} on:selection={selectionEvent}
						on:endDrag={endDragEvent} />
		</div>
	</div>

</div>

