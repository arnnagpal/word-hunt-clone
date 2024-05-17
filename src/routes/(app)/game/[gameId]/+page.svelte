<script lang="ts">
    import Game from '$lib/Game.svelte';
    import type {PageData} from './$types';
    import GameHeader from '$lib/GameHeader.svelte';
    import {type ScoreEvent, WordSelectionState, Board, UpdateType, type SelectionEvent, SessionType} from 'ambient';
    import GameScore from '$lib/GameScore.svelte';
    import {afterNavigate, beforeNavigate, goto, invalidateAll} from "$app/navigation";
	import { onMount } from 'svelte';

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

    let board: Board;
    let timer = -1;
    let word_bank: string[] = [];

    $: {
        if (data.game?.board && !board) {
            board = JSON.parse(<string>data.game.board) as Board;
        }

        if (data.player?.word_bank) {
            const wordBank = <string[]>data.player.word_bank;
            if (wordBank.length > word_bank.length) {
                word_bank = wordBank;
                wordCount = wordBank.length;
            }
        }

        if (data.player?.score) {
            const playerScore = <number>data.player.score;
            if (playerScore > score) {
                score = playerScore;
            }
        }

        if (data.player?.time_left && timer === -1) {
            timer = <number>data.player?.time_left;
        }
    }

    function scoreChange(event: CustomEvent<ScoreEvent>) {
        score += event.detail.points;
        wordCount += 1;

        word_bank.push(event.detail.word);

        selectionStatus = WordSelectionState.NewWord;
        console.log(`new selection status ${WordSelectionState[selectionStatus]}`);

        lastWord = event.detail.word;
        lastPoints = event.detail.points;
    }

    async function selectionEvent(event: CustomEvent<SelectionEvent>) {
        selectionStatus = event.detail.selectionStatus;
        console.log(`selection event: ${JSON.stringify(event.detail)}`);

        lastWord = event.detail.wholeWord;
        lastPoints = event.detail.points;

        await selectGameLetter(event.detail.letter, event.detail.letterIndex, event.detail.letterRow, event.detail.letterColumn);

        animateScore = false;
        showScore = true;
        if (showScoreInterval) clearTimeout(showScoreInterval);
    }

    async function endDragEvent() {
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

        await clearGameSelection();
    }

    async function selectGameLetter(letter: string, index: number, row: number, col: number) {
        if (!data.game) return;
        if (!data.auth_session) return;

        const session = data.auth_session;
        const game = data.game;

        const response = await fetch(`/api/game/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "game_id": game.id,
                "auth_token": session.id,
                "update_type": UpdateType.LetterSelection,
                "update_data": {
                    "letter": letter,
                    "index": index,
                    "row": row,
                    "col": col
                }
            })
        });

        if (response.ok) {
            console.log('Letter selected');
        }
    }

    async function clearGameSelection() {
        if (!data.game) return;
        if (!data.auth_session) return;

        const session = data.auth_session;
        const game = data.game;

        const response = await fetch(`/api/game/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "game_id": game.id,
                "auth_token": session.id,
                "update_type": UpdateType.SubmitSelection,
                "update_data": {
                }
            })
        });

        if (response.ok) {
            console.log('Selection submitted');
        }
    }

    async function updateUserTime() {
        if (!data.game) return;
        if (!data.auth_session) return;
        
        const session = data.auth_session;
        const game = data.game;

        // update game player time
        const response = await fetch(`/api/game/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "game_id": game.id,
                "auth_token": session.id,
                "update_type": UpdateType.TimeUpdate,
                "update_data": {
                    "time_left": timer
                }
            })
        });

        if (response.ok) {
            const updatedGame = await response.json();

            if (updatedGame.game_status === SessionType[SessionType.Finished]) {
                console.log('Game finished');
                // redirect to game over page (or for now, just go back to dashboard)

                goto('/app');
            }
        } else {
            console.error('Failed to update time');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function timeOver() {
        console.log('Time Over');
        gameDisabled = true;

        timer = 0;
        await updateUserTime();
    }

    onMount(() => {
        if (data.player?.time_left === -1) {
            // unlimited time
            return;
        }

        const timerInterval = setInterval(async () => {
            timer--;

            await updateUserTime();

            if (timer === 0) {
                timeOver();
                clearInterval(timerInterval);
            }
        }, 1000);

        return () => {
            clearInterval(timerInterval);
        }
    });

    beforeNavigate(async () => {
        await updateUserTime();
        invalidateAll();
    });

    afterNavigate(async () => {
        await updateUserTime();
        invalidateAll();
    });

</script>

<svelte:head>
    <title>Word Hunt - In Game</title>
    <meta content="Word Hunt - In Game" name="description"/>
</svelte:head>

<div class="flex flex-col justify-between items-center">

    <div class="flex flex-col items-center h-1/4">
        <!--		game header   -->
        <GameHeader data={data} bind:score={score} bind:words={wordCount} bind:time={timer}/>
    </div>

    <div class="flex flex-col items-center w-screen h-[15vh] mt-20">
        <!--    game score on top of board -->
        {#if showScore}
            <GameScore bind:animate={animateScore} bind:word={lastWord} bind:points={lastPoints}
                       bind:selectionStatus={selectionStatus}/>
        {/if}
    </div>

    <div class="flex flex-col items-center h-[85vh]">
        <div>
            <Game bind:disabled={gameDisabled} bind:wordBank={word_bank} bind:board={board} on:endDrag={endDragEvent} on:score={scoreChange}
                  on:selection={selectionEvent}/>
        </div>
    </div>

</div>

