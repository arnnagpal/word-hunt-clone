<script lang="ts">
    import Game from "$lib/Game.svelte";
    import type {PageData} from './$types';
    import GameHeader from "$lib/GameHeader.svelte";
    import type {ScoreEvent, TimeOverEvent} from "ambient";
    import GameScore from "$lib/GameScore.svelte";

    export let data: PageData;

    let score = 0;
    let wordCount = 0;

    let gameDisabled: boolean;

    let showScore = false;
    let lastWord = 'ATE';
    let lastPoints = 100;

    let showScoreInterval: NodeJS.Timeout;

    function scoreChange(event: CustomEvent<ScoreEvent>) {
        score += event.detail.points;
        wordCount += 1;

        lastWord = event.detail.word;
        lastPoints = event.detail.points;

        if (showScoreInterval) clearTimeout(showScoreInterval);
        showScore = true;
        showScoreInterval = setTimeout(() => {
            showScore = false;
        }, 2000);
    }

    function timeOver(event: CustomEvent<TimeOverEvent>) {
        console.log('Time Over');
        gameDisabled = true;
    }

</script>

<svelte:head>
    <title>Word Hunt - Maddie ❣️</title>
    <meta content="Word Hunt - Maddie ❣️" name="description"/>
</svelte:head>

<div class="overflow-y-hidden bg-repeat bg-page-game-background bg-cover bg-center h-screen flex flex-col justify-between items-center">
    <div class="flex flex-col items-center h-1/4">
        <!--		game header   -->
        <GameHeader bind:score={score} bind:words={wordCount} on:timeup={timeOver} time={-1}/>
    </div>

    <div class="flex flex-col items-center w-screen h-[15vh] mt-20">
        <!--    game score on top of board -->
        {#if showScore}
            <GameScore word={lastWord} points={lastPoints}/>
        {/if}
    </div>

    <div class="flex flex-col items-center h-[85vh]">
        <div>
            <Game bind:disabled={gameDisabled} board={data.board} on:score={scoreChange}/>
        </div>
    </div>
</div>

