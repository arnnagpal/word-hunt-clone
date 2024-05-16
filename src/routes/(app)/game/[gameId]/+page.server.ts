import {fail, redirect} from "@sveltejs/kit";
import type {PageServerLoad} from "./$types";
import {gamePlayerRepository, gameRepository, type RedisGame, type RedisGamePlayer} from "$lib/server/redis";
import { SessionType } from "ambient";

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
        game_id: params.gameId,
        game: redisGame,
        player: redisGamePlayer,
        auth_session: event.locals.session,
        auth_user: event.locals.user
    };
};
