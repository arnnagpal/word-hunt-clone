import {fail, redirect} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import {gameRepository} from "$lib/server/redis";
import type {Board} from "ambient";

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    const params = event.params;

    if (!user) {
        redirect(302, "/login");
    }

    // check if user is in this game
    const gameEntity = await gameRepository.search()
        .where('id').eq(params.gameId)
        .where('players').contains(user.id)
        .returnFirst();

    if (!gameEntity) {
        console.log("Game not found for user", user.id);
        redirect(302, "/app");
    }

    if (!gameEntity.timer) {
        return fail(500, {"message": "Game timer not found"});
    }

    if (!gameEntity.board) {
        return fail(500, {"message": "Game board not found"});
    }

    // retrieve board from game
    const board = JSON.parse(gameEntity.board as string) as Board;

    let timer = gameEntity.timer as number;
    if (timer > 0) {
        const now = Date.now();
        const ended_at = (gameEntity.ended_at as Date).getTime() / 1000;
        timer = (ended_at - now) / 1000;
        if (timer < 0) {
            redirect(302, "/app");
        }
    }
    event.depends('app:random');
    return {
        time: timer,
        board: board as Board
    };
};
