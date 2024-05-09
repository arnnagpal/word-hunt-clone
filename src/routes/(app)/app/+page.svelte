<script lang="ts">
    import {Label} from "$lib/components/ui/label";
    import {onMount} from "svelte";
    import LogoutForm from "$lib/components/logout/LogoutForm.svelte";
    import type {PageData} from "./$types";

    onMount(() => {
        console.log("Dashboard page loaded");
    });

    export let data: PageData;
</script>

<svelte:head>
    <title>Word Hunt - Dashboard</title>
    <meta content="Word Hunt - Dashboard" name="description"/>
</svelte:head>

<div class="flex justify-center items-center">
    <div class="flex justify-center items-center h-screen w-[70vw]">
        <div class="flex justify-center flex-col bg-white rounded-lg shadow-2xl p-2 pl-6 pr-6">
            <Label class="text-4xl font-bold mt-2 mb-3 text-center">Dashboard there bud</Label>

            <LogoutForm data={data}/>
        </div>

    </div>
</div>
