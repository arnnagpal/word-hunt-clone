import {fail, redirect} from "@sveltejs/kit";
import type {Actions, PageServerLoad} from "./$types";
import {gamePlayerRepository, gameRepository, type RedisGame, type RedisGamePlayer} from "$lib/server/redis";
import { SessionType, UpdateType } from "ambient";
import {superValidate} from "sveltekit-superforms";
import {zod} from "sveltekit-superforms/adapters";
import {z} from "zod";

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

    if (gameEntity.session_type == SessionType.Finished) {
        console.log("Game is already finished");
        redirect(302, "/app");
    }

    if (!gameEntity.timer) {
        return fail(500, {"message": "Game timer not found"});
    }

    if (!gameEntity.board) {
        return fail(500, {"message": "Game board not found"});
    }

    // get game player
    const gamePlayer = await gamePlayerRepository.search()
        .where('game_id').eq(params.gameId)
        .where('id').eq(user.id)
        .returnFirst();

    if (!gamePlayer) {
        console.log("Game player not found for user", user.id);
        redirect(302, "/app");
    }

    const redisGame = {
        id: gameEntity.id,
        players: gameEntity.players,
        board: gameEntity.board,
        timer: gameEntity.timer,
        created_at: gameEntity.created_at,
        ended_at: gameEntity.ended_at,
        single_player: gameEntity.single_player,
        session_type: gameEntity.session_type
    };

    const redisGamePlayer = {
        id: gamePlayer.id,
        game_id: gamePlayer.game_id,
        name: gamePlayer.name,
        word_bank: gamePlayer.word_bank,
        letters_selected: gamePlayer.lettersSelected,
        time_left: gamePlayer.time_left,
        score: gamePlayer.score
    };

    return {
        form: await superValidate(zod(z.object({}))),
        game_id: params.gameId,
        game: redisGame,
        player: redisGamePlayer,
        auth_session: event.locals.session,
        auth_user: event.locals.user
    };
};

export const actions: Actions = {
    exit: async (event) => {
        if (!event.locals.session) {
            throw fail(401);
        }

        // add fake delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 500));

        const gameId = event.params.gameId;
        const session = event.locals.session;

        // make an update request to the game
        const response = await event.fetch(`/api/game/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "game_id": gameId,
                "auth_token": session.id,
                "update_type": UpdateType.TimeUpdate,
                "update_data": {
                    "time_left": 0
                }
            })
        });

        if (response.ok) {
            const updatedGame = await response.json();

            if (updatedGame.game_status === SessionType[SessionType.Finished]) {
                console.log('Game finished');
                // redirect to game over page (or for now, just go back to dashboard)
                redirect(302, "/app");
            } else {
                console.log('Game updated');

                // redirect to dashboard
                redirect(302, "/app");
            }
        } else {
            console.error('Failed to update time');
        }
    },
};