import {error, json, type RequestHandler} from '@sveltejs/kit';
import {lucia} from '$lib/server/auth';
import {gameRepository} from "$lib/server/redis";
import {SessionType} from "ambient";

export const POST: RequestHandler = async ({request}) => {
    const {game_id, auth_token, update_type, update_data} = await request.json();

    if (!game_id || typeof game_id !== 'string') {
        return error(400, 'Invalid game id');
    }

    if (!auth_token || typeof auth_token !== 'string') {
        return error(400, 'Invalid auth token');
    }

    if (!update_type || typeof update_type !== 'number') {
        return error(400, 'Invalid update type');
    }



    // check if auth token is valid session
    const session = await lucia.validateSession(auth_token);

    if (!session) {
        return error(400, 'Invalid session');
    }

    //check for valid game id
    const game = await gameRepository.search()
        .where('id').eq(game_id).returnFirst();

    if (!game) {
        return error(400, 'Invalid game id');
    }

    // check if the game is already finished
    if (game.ended_at !== 0) {
        return error(400, 'Game already finished');
    }

    // update the game to be finished
    game.ended_at = Date.now();
    game.session_type = SessionType.Finished;
    game.win

    return json({
        game_id
    }, {
        status: 202
    });
};