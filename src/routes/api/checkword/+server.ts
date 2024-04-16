import { error } from '@sveltejs/kit';
import {dictionary} from "$lib/server/dictionary";
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
    const word = url.searchParams.get('word');

    if (!word) {
        error(400, 'word must be provided');
    }

    let wordToCheck = word.toUpperCase();

    const result = dictionary.hasSubString(wordToCheck, true);

    return new Response(JSON.stringify({
        word: wordToCheck,
        found: result,
        total: dictionary.length
    }));
};