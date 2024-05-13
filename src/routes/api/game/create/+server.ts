import {error, json, type RequestHandler} from '@sveltejs/kit';
import {generateIdFromEntropySize} from "lucia";
import {SessionType} from "ambient";
import {gameRepository} from "$lib/server/redis";
import {createBoard} from "../../createboard/+server";
import {User} from "$lib/server/database";

export const POST: RequestHandler = async ({request}) => {
    let {auth_token, timer, single} = await request.json();

    // check auth token
    if (!auth_token || typeof auth_token !== 'string') {
        return error(400, 'Invalid auth token');
    }

    // check timer
    if (!timer || typeof timer !== 'number') {
        return error(400, 'Invalid timer');
    }

    // check singleplayer
    if (typeof single !== 'boolean') {
        return error(400, 'Invalid param \'single\'');
    }

    // check if auth token is valid session
    const user = await User.findOne({_id: auth_token}).exec();
    if (!user) {
        return error(400, 'Invalid auth token');
    }

    // create a new board using the api
    const board = await createBoard(4);

    const game_id = generateIdFromEntropySize(10);

    timer += 5; // add 5 seconds to the timer for the game to start

    const start_date = Date.now();
    const end_date = new Date(start_date);
    end_date.setTime(end_date.getTime() + timer * 1000);

    let game = {
        id: game_id,
        session_type: SessionType.Active,
        timer: timer,
        players: [auth_token],
        playerData: JSON.stringify(
            [
                {
                    id: auth_token,
                    score: 0
                }
            ]
        ),
        winner: "",
        board: JSON.stringify(board),
        created_at: Date.now(),
        ended_at: timer > 0 ? end_date.getTime() : 0,
        single_player: single
    };

    await gameRepository.save(game);

    return json({
        game_id
    }, {
        status: 202
    });
};