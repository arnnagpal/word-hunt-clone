<script lang="ts">
    import {superForm} from "sveltekit-superforms";
    import type {PageData} from "./$types";
    import WaitingSpinner from "$lib/WaitingSpinner.svelte";

    import * as Form from "$lib/components/ui/form";

    export let data: PageData;

    const form = superForm(data.form, {
        delayMs: 500,
        timeoutMs: 8000
    });

    const {enhance, delayed, timeout} = form;
</script>


<form action="?/logout" class="flex flex-col justify-center items-center" method="POST" use:enhance>
    <Form.Button class="mt-4 bg-[#A4E593]
                      transition-all duration-200 ease-in-out
                      hover:bg-[#8dde78] text-gray-900 text-xl
                      font-bold py-3 px-10 rounded shadow-xl mb-5">Logout
    </Form.Button>

    {#if $delayed || $timeout}
        <WaitingSpinner/>
    {/if}
</form>