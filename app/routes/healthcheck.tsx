import type { LoaderArgs } from '@remix-run/node';

import { prisma } from '~/db.server';

export const loader = async ({ request }: LoaderArgs) => {
	const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('host');

	try {
		const url = new URL('/', `http://${host}`);
		// if we can connect to the database and make a simple query
		// and make a HEAD request to ourselves, then we're good.
		await Promise.all([
			prisma.users.count(),
			fetch(url.toString(), { method: 'HEAD' }).then((r) => {
				if (!r.ok) return Promise.reject(r);
			})
		]);
		return new Response('OK');
	} catch (error: unknown) {
		console.log('healthcheck ❌', { error });
		return new Response('ERROR', { status: 500 });
	}
};
