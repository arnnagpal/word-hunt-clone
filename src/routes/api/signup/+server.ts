import {error, json, type RequestHandler} from '@sveltejs/kit';
import {hash} from '@node-rs/argon2';
import {generateIdFromEntropySize} from 'lucia';
import {User} from '$lib/server/database';
import {UserRole} from 'ambient';
import {lucia} from '$lib/server/auth';

export const POST: RequestHandler = async ({request}) => {
    const {email, username, displayName, password} = await request.json();

    if (!email || typeof email !== 'string') {
        return error(400, 'Invalid email');
    }

    if (!username || typeof username !== 'string') {
        return error(400, 'Invalid username');
    }

    if (!displayName || typeof displayName !== 'string') {
        return error(400, 'Invalid display name');
    }

    if (!password || typeof password !== 'string') {
        return error(400, 'Invalid password');
    }

    const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    const userId = generateIdFromEntropySize(10); // 16 characters long

    // check if user with email or username already exists
    // if it does, return error
    // otherwise, create user

    const user = await User.findOne({$or: [{email}, {username}]}).exec();
    if (user) {
        return error(400, 'User already exists');
    }

    const newUser = new User({
        _id: userId,
        email: email,
        username: username,
        display_name: displayName,
        password_hash: passwordHash,
        games: [],
        role: UserRole.User
    });

    await newUser.save();

    const session = await lucia.createSession(userId, {});

    return json({
        session_id: session.id
    }, {
        status: 202
    });

};