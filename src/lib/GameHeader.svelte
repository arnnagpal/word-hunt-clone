<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import type {TimeOverEvent} from "ambient";

export let words: number = 0;
export let score: number = 0;

export let time = -1;

const dispatch = createEventDispatcher();

onMount(() => {
    if (time === -1) return;

    const timer = setInterval(() => {
        time--;

        if (time === 0) {
            dispatch('timeup', {"words": words, "score": score} as TimeOverEvent);
            clearInterval(timer);
        }
    }, 1000);

    return () => {
        clearInterval(timer);
    }
});

function fancyTimeFormat(duration: number) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
}
</script>


<div class="flex flex-col">
    <!-- game header with the score, and words count text -->
    <!-- svelte + tailwind -->
    <div class="flex justify-center items-center bg-white w-[74vw] h-20 rounded-b-xl">
        <div class="flex flex-col text-left">
            <p class="text-xl font-extrabold -mb-2">WORDS: {words}</p>
            <p class="text-3xl font-extrabold">SCORE: {String(score).padStart(4, '0')}</p>
        </div>
    </div>

<!--    on the right side of the game header -->
    {#if time > -1}
        <div class="flex justify-center items-center bg-green-950 bg-opacity-40 text-white text-center w-[18vw] rounded-b-xl ml-auto mr-4">
            <p class="text-md font-bold pb-0.5">{fancyTimeFormat(time)}</p>
        </div>
    {/if}
</div>


