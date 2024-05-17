import { error, json, type RequestHandler } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import { gamePlayerRepository, gameRepository } from "$lib/server/redis";
import { Board, SessionType, UpdateType, getPoints } from "ambient";
import { Game, User } from '$lib/server/database';
import { EntityId } from 'redis-om';

export const POST: RequestHandler = async ({ request }) => {
    const { game_id, auth_token, update_type, update_data } = await request.json();

    if (!game_id || typeof game_id !== 'string') {
        return error(400, 'Invalid game id');
    }

    if (!auth_token || typeof auth_token !== 'string') {
        return error(400, 'Invalid auth token');
    }

    if (typeof update_type !== 'number') {
        return error(400, 'Invalid update type');
    }

    if (!update_data || typeof update_data !== 'object') {
        return error(400, 'Invalid update data');
    }

    // check if auth token is valid session
    const session = await lucia.validateSession(auth_token);

    if (!session) {
        return error(400, 'Invalid session');
    }

    if (!session.user) {
        return error(400, 'Invalid session user');
    }

    //check for valid game id
    const game = await gameRepository.search()
        .where('id').eq(game_id)
        .where('players').contains(session.user.id)
        .returnFirst();

    if (!game) {
        return error(400, 'Invalid game id');
    }

    if (!game.board) {
        return error(400, 'Invalid board data');
    }

    const ended_at = <number>game.ended_at;
    // check if the game is already finished
    if (ended_at !== 0) {
        console.log(ended_at);
        return error(400, 'Game already finished');
    }

    if (!game.players) {
        return error(400, 'Invalid players data');
    }

    if (update_type === UpdateType.JoinedGame) {
        const players = <string[]>game.players;
        if (players.includes(session.user.id)) {
            return error(400, 'Already joined game');
        }

        let newGamePlayer = {
            id: session.user.id,
            game_id,
            name: session.user.username,
            letters_selected: [],
            time_left: game.timer,
            score: 0
        };

        await gamePlayerRepository.save(newGamePlayer);

        return json({
            game_id
        }, {
            status: 202
        });
    }

    const board = Board.fromJSON(<string>game.board);

    const gamePlayer = await gamePlayerRepository.search()
        .where('game_id').eq(game_id)
        .where('id').eq(session.user.id)
        .returnFirst();

    if (!gamePlayer) {
        return error(400, 'Invalid game player');
    }

    switch (update_type) {
        case UpdateType.LetterSelection:

            if (!update_data.letter) {
                return error(400, 'Invalid letter data');
            }

            if (typeof(update_data.row) !== 'number' || typeof(update_data.col) !== 'number') {
                return error(400, 'Invalid position data');
            }

            if (typeof(update_data.index) === 'undefined') {
                return error(400, 'Invalid index data');
            }

            const index = update_data.index;

            // check if the board has the letter
            const x = update_data.row;
            const y = update_data.col;

            if (x < 0 || x >= board.size || y < 0 || y >= board.size) {
                return error(400, 'Invalid position data');
            }

            const letter = board.get_from_coords(x, y);

            if (letter !== update_data.letter) {
                return error(400, 'Invalid letter data');
            }

            if (typeof(gamePlayer.letters_selected) !== 'object') {
                return error(400, 'Invalid letters selected data');
            }

            const lettersSelected: string[] = <string[]>gamePlayer.letters_selected;

            // insert the letter at the index using splice
            lettersSelected.splice(index, 0, update_data.letter);

            gamePlayer.letters_selected = lettersSelected;
            gamePlayerRepository.save(gamePlayer);

            break;
        case UpdateType.SubmitSelection:
            if (!gamePlayer) {
                return error(400, 'Invalid game player');
            }

            if (typeof(gamePlayer.letters_selected)  !== 'object') {
                return error(400, 'Invalid letters selected data');
            }

            if (typeof(gamePlayer.word_bank) !== 'object') {
                return error(400, 'Invalid word bank data');
            }

            if (typeof(gamePlayer.score) !== 'number') {
                return error(400, 'Invalid score data');
            }

            const wordBank = <string[]>gamePlayer.word_bank;
            const letters = <string[]>gamePlayer.letters_selected;
            const word = letters.join('');

            gamePlayer.letters_selected = [];

            if (board.is_solution(word)) {
                gamePlayer.score = <number>gamePlayer.score + getPoints(word);
                wordBank.push(word);
            }

            gamePlayer.word_bank = wordBank;

            gamePlayerRepository.save(gamePlayer);

            break;
        case UpdateType.TimeUpdate:
            if (!gamePlayer) {
                return error(400, 'Invalid game player');
            }
            if (typeof(gamePlayer.time_left) !== 'number') {
                return error(400, 'Invalid time left data');
            }

            if (typeof(update_data.time_left) !== 'number') {
                return error(400, 'Invalid time left data');
            }

            gamePlayer.time_left = update_data.time_left;
            gamePlayerRepository.save(gamePlayer);

            if (gamePlayer.time_left === 0) {
                const gamePlayers = await gamePlayerRepository.search()
                    .where('game_id').eq(game_id)
                    .returnAll();

                let allPlayersFinished = true;
                for (const player of gamePlayers) {
                    if (<number>player.time_left > 0) {
                        allPlayersFinished = false;
                        break;
                    }
                }

                if (allPlayersFinished) {
                    let winner = '';
                    let maxScore = 0;
                    for (const player of gamePlayers) {
                        if (<number>player.score > maxScore) {
                            maxScore = <number>player.score;
                            winner = <string>player.id;
                        }
                    }

                    if (maxScore === 0) {
                        // winner is the first player in the list
                        winner = <string>gamePlayers[0].id;
                    }

                    game.winner = winner;
                    game.ended_at = Date.now();
                    game.session_type = SessionType.Finished;

                    gameRepository.save(game);

                    // convert all game players into GamePlayer objects
                    let gamePlayersData = [];
                    for (const player of gamePlayers) {
                        gamePlayersData.push({
                            id: <string>player.id,
                            words: <string[]>player.word_bank,
                            score: <number>player.score
                        });
                    }

                    // create a mongo game object
                    const mongoGame = new Game({
                        _id: game_id,
                        players: gamePlayersData,
                        board: board.toJSON(),
                        created_at: <number>game.created_at,
                        ended_at: <number>game.ended_at,
                        winner: game.winner,
                        single_player: <boolean>game.single_player,
                        session_type: game.session_type
                    });

                    await mongoGame.save();

                    const user = session.user;
                    const mongoUser = await User.findOne({_id: user.id}).exec();
                    if (mongoUser) {
                        mongoUser.games.push(game_id);
                        await mongoUser.save();
                    }

                    // delete the game from redis
                    if (game[EntityId]) {
                        console.log("Removing game from redis");
                        await gameRepository.remove(game[EntityId]);
                    }

                    for (const player of gamePlayers) {
                        if (player[EntityId]) {
                            console.log("Removing player " + player.id + " from redis");
                            await gamePlayerRepository.remove(player[EntityId]);
                        }
                    }

                    return json({
                        game_id,
                        game_status: SessionType[SessionType.Finished]
                    }, {
                        status: 202
                    });
                }
            }
            break;
        default:
            return error(400, 'Invalid update type');
    }

    return json({
        game_id,
        game_status: SessionType[<number>game.session_type]
    }, {
        status: 202
    });
};