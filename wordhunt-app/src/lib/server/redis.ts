import {createClient} from 'redis'
import {Repository, Schema} from 'redis-om';
import dotenv from "dotenv";

if (!process.env.REDIS_URL) {
    dotenv.config();
}

const connectionString = process.env.REDIS_URL;

if (!connectionString) {
    throw new Error('REDIS_URL is not defined');
}

export const redis = createClient({url: connectionString});
redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect();
console.log("Redis connected");

export type RedisGame = {
    id: string,
    session_type: number,
    timer: number,
    winner: string,
    board: string,
    players: string[],
    created_at: number,
    ended_at: number,
    single_player: boolean
};

export type RedisGamePlayer = {
    id: string,
    game_id: string,
    name: string,
    letters_selected: string[],
    word_bank: string[],
    time_left: number,
    score: number
};

export const gameSchema = new Schema('game', {
    id: {
        type: 'string',
        caseSensitive: true,
    },
    session_type: {
        type: 'number'
    },
    timer: {
        type: 'number'
    },
    winner: {
        type: 'string',
        caseSensitive: true
    },
    board: {
        type: 'string',
        caseSensitive: true
    },
    players: {
        type: 'string[]',
        caseSensitive: true
    },
    created_at: {
        type: 'number'
    },
    ended_at: {
        type: 'number'
    },
    single_player: {
        type: 'boolean'
    }
});

export const gamePlayerSchema = new Schema('gamePlayer', {
    id: {
        type: 'string',
        caseSensitive: true
    },
    game_id: {
        type: 'string',
        caseSensitive: true
    },
    name: {
        type: 'string',
        caseSensitive: true
    },
    letters_selected: {
        type: 'string[]',
        caseSensitive: true
    },
    word_bank: {
        type: 'string[]',
        caseSensitive: true
    },
    time_left: {
        type: 'number'
    },
    score: {
        type: 'number'
    }
});

export const gameRepository = new Repository(gameSchema, redis);
await gameRepository.createIndex();

export const gamePlayerRepository = new Repository(gamePlayerSchema, redis);
await gamePlayerRepository.createIndex();