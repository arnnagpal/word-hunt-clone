import type { PageLoad } from './$types';
import {Board} from "ambient";

export const ssr = false;

export const load: PageLoad = async ({ params }) => {

    // Fetch data from an API
    const board = await generateBoard(4) as Board;

    return {
        board: board,
    };
};

async function generateBoard(size: number): Promise<Board> {
    const res = await fetch('/api/createboard?size=' + size);
    const data = await res.json();

    console.log("Generated board with size " + size + " and got " + JSON.stringify(data.board));

    return data.board;
}