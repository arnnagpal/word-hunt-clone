import { dev } from '$app/environment';
import { Lucia, type RegisteredDatabaseUserAttributes } from 'lucia';
import { mongoAdapter } from '$lib/server/database';
import type { UserRoleType } from 'ambient';

export const lucia = new Lucia(mongoAdapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes: RegisteredDatabaseUserAttributes) => {
		return {
			email: attributes.email,
			username: attributes.username,
			display_name: attributes.display_name,
			role: attributes.role
		}
	}
});

// IMPORTANT!
declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			display_name: string;
			email: string;
			role: UserRoleType
		};
	}
}

export function isValidEmail(email: string): boolean {
	return /.+@.+/.test(email);
}