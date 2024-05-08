import { error, type RequestHandler } from '@sveltejs/kit';
import { User } from '$lib/server/database';
import { verify } from '@node-rs/argon2';
import { lucia } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	const { username, password } = await request.json();

	if (!username || typeof username !== 'string') {
		return error(400, 'Invalid username');
	}

	if (!password || typeof password !== 'string') {
		return error(400, 'Invalid password');
	}

	const user = await User.findOne({ username }).exec();

	if (!user) {
		return error(400, "Invalid username/email or password");
	}

	const validPassword = await verify(user.password_hash, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	if (!validPassword) {
		return error(400, "Invalid username/email or passowrd");
	}

	const session = await lucia.createSession(user.id, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/",
			"Set-Cookie": sessionCookie.serialize()
		}
	});
};