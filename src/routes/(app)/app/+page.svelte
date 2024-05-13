<script lang="ts">
    import {Label} from "$lib/components/ui/label";
    import {onMount} from "svelte";
    import type {PageData} from "./$types";
    import {Button} from "$lib/components/ui/button";
    import { LogOut } from 'lucide-svelte';
    import LogoutButton from "$lib/components/logout/LogoutButton.svelte";

    onMount(() => {
        console.log("Dashboard page loaded");
    });

    function logout() {

    }

    export let data: PageData;
</script>

<svelte:head>
    <title>Word Hunt - Dashboard</title>
    <meta content="Word Hunt - Dashboard" name="description"/>
</svelte:head>

<div class="flex justify-center items-center">
    <div class="flex justify-center items-center h-screen">
        <div class="flex justify-center flex-col bg-white w-[85vw] max-w-[440px] rounded-lg shadow-2xl px-6 py-3">
            <div class="flex justify-center flex-col pb-5">
                <div class="relative pt-2">

<!--                    <Button class="absolute top-0 left-0 rotate-180 transition-all duration-200 ease-in-out-->
<!--                 text-gray-900 text-4xl-->
<!--                      font-bold rounded mt-[26px]" href="/" variant="ghost" on:click={logout} >-->

<!--                    </Button>-->
                    <div class="absolute top-0 left-0 mt-[26px]">
                        <LogoutButton data={data} />
                    </div>

                    <Label class="block m-auto text-4xl font-bold text-center flex-grow">DASHBOARD</Label>
                </div>
                <Label class="text-xl font-bold text-center -mt-1">WELCOME, {data.user.display_name.toUpperCase()}</Label>
            </div>

            <Label class="text-xl font-bold text-center mb-1">SINGLEPLAYER</Label>
            <Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                       rounded mb-2" href="/" variant="default"> Classic
            </Button>
            <Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                      rounded mb-4" href="/" variant="default"> Unlimited
            </Button>

            <Label class="text-xl font-bold text-center mb-1">MULTIPLAYER</Label>
            <Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                       rounded mb-2" href="/" variant="default"> Quick Play
            </Button>

            <Button class="transition-all duration-200 ease-in-out
                 text-gray-900 text-xl
                       rounded mb-4" href="/" variant="default"> Create a Game
            </Button>
        </div>


    </div>
</div>
