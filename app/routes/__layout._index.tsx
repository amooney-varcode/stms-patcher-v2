import { json, redirect } from '@remix-run/node';
import type { LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getUserId } from '~/session.server';

export const loader = async ({ request }: LoaderArgs) => {
	const userId = await getUserId(request);

	if (!userId) return redirect('/login');

	return json({ users: [userId] });
};
export const meta: V2_MetaFunction = () => [{ title: 'Varcode' }];

const Index = () => {
	// const user = useOptionalUser();
	const data = useLoaderData<typeof loader>();
	console.log(data);

	return (
		<div>
			<h1>Chose Page</h1>
		</div>
	);
};

export default Index;
