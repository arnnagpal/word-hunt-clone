import {createClient} from 'redis'
import {Repository, Schema} from 'redis-om';
import dotenv from "dotenv";

if (!process.env.REDIS_URL) {
    dotenv.config();
}

let connectionString = process.env.REDIS_URL;

if (!connectionString) {
    throw new Error('REDIS_URL is not defined');
}

export const redis = createClient({url: connectionString});
redis.on('error', (err) => console.log('Redis Client Error', err));
await redis.connect();
console.log("Redis connected");

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
    playerData: {
        type: 'string',
        caseSensitive: true,
    },
    created_at: {
        type: 'date'
    },
    ended_at: {
        type: 'date'
    },
    single_player: {
        type: 'boolean'
    }
});

export const gameRepository = new Repository(gameSchema, redis);
await gameRepository.createIndex();