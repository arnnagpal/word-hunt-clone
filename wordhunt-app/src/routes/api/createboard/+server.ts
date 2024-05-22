import type {RequestHandler} from "../../../../.svelte-kit/types/src/routes/api/checkword/$types";
import {error} from "@sveltejs/kit";
import {Board, type BoardSolution, getPoints, type Position} from "ambient";
import {dictionary, letterFrequency} from "$lib/server/dictionary";

export const GET: RequestHandler = async ({url}) => {
    const size = url.searchParams.get('size');

    if (!size) {
        error(400, 'size must be provided');
    }

    const board_size = Number.parseInt(size);

    if (!Number.isInteger(board_size)) {
        error(400, 'size must be an integer');
    }

    if (board_size < 4 || board_size > 8) {
        error(400, 'size must be between 4 and 8');
    }

    // time the generation and solving of the board separately and print it
    const board = await createBoard(board_size);

    return new Response(JSON.stringify({
        board: board
    }));
};

export const createBoard = async (size: number) => {
    console.time('generateBoard');
    const board = generateBoard(size);
    console.timeEnd('generateBoard');

    console.time('solveBoard');
    const solutions = solveBoard(board);
    console.timeEnd('solveBoard');

    board.possible_solutions = solutions;
    board.total_possible_score = solutions.reduce((acc, solution) => acc + solution.points, 0);
    return board;
}

const binarySearch = (arr: number[], target: number): number => {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
}

export const generateBoard = (size: number): Board => {
    const board = new Board(size);
    const letters = Object.keys(letterFrequency);
    const frequencySum = Object.values(letterFrequency).reduce((a, b) => a + b, 0);

    const cumulativeFrequency: number[] = [];
    let sum = 0;

    for (let i = 0; i < letters.length; i++) {
        sum += letterFrequency[letters[i]];
        cumulativeFrequency[i] = sum;
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const rand = Math.floor(Math.random() * frequencySum);
            const k = binarySearch(cumulativeFrequency, rand);
            board.set_from_coords(i, j, letters[k]);
        }
    }

    return board;
}

function backTrack(board: Board, currentWord: string, currentCell: Position, path: Position[], depth: number, foundWord: (arg0: string) => void) {
    // Check if current word is in dictionary
    if (currentWord.length >= 3 && dictionary.hasSubString(currentWord, true)) {
        // console.log(`backtrack: ${currentWord}, ${currentCell}, ${depth}, ${this.board.length}`)
        foundWord(currentWord);
    }
    depth += 1;
    const adjacent = board.get_adjacent_positions(currentCell);
    for (const nextCell of adjacent) {
        // check if we've visited this cell
        if (path.indexOf(nextCell) !== -1) continue;
        const nextLetter = board.get_from_pos(nextCell);
        const nextWord = currentWord + nextLetter;
        // checkc that the next word is a substring in the dictionary
        if (!dictionary.hasSubString(nextWord)) continue;

        path.push(nextCell);
        backTrack(board, nextWord, nextCell, path, depth, foundWord);
        path.pop();
    }
}

export function solveBoard(board: Board): BoardSolution[] {
    const solutions: BoardSolution[] = [];
    const words: string[] = [];
    const foundWord = (word: string) => {
        if (words.indexOf(word) !== -1) return;

        words.push(word);
        solutions.push({word, points: getPoints(word)});
    };
    // solve using the backtracking algorithm
    for (let x = 0; x < board.size; x++) {
        for (let y = 0; y < board.size; y++) {
            const letter = board.get_from_coords(x, y);
            backTrack(board, letter, {x, y}, [], 0, foundWord);
        }
    }
    return solutions;
}