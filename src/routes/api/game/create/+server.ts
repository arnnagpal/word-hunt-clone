import {error, json, type RequestHandler} from '@sveltejs/kit';
import {generateIdFromEntropySize} from "lucia";
import {SessionType} from "ambient";
import {gamePlayerRepository, gameRepository} from "$lib/server/redis";
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

    let game = {
        id: game_id,
        session_type: SessionType.Active,
        timer: timer,
        players: [auth_token],
        winner: "",
        board: board.toJSON(),
        created_at: Date.now(),
        ended_at: 0,
        single_player: single
    };

    let gamePlayer = {
        id: auth_token,
        game_id: game_id,
        name: user.name,
        word_bank: [],
        letters_selected: [],
        time_left: timer,
        score: 0
    };

    await gameRepository.save(game);
    await gamePlayerRepository.save(gamePlayer);

    return json({
        game_id
    }, {
        status: 202
    });
};