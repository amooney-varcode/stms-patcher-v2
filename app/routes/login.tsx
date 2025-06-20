import { Button, Input } from '@nextui-org/react';
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useSearchParams } from '@remix-run/react';
import { useEffect, useRef } from 'react';

import { verifyLogin } from '~/models/user.server';
import { createUserSession, getUserId } from '~/session.server';
import { safeRedirect, validateEmail } from '~/utils';

export const loader = async ({ request }: LoaderArgs) => {
	const userId = await getUserId(request);

	if (userId) return redirect('/');

	return json({});
};

export const action = async ({ request }: ActionArgs) => {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	const redirectTo = safeRedirect(formData.get('redirectTo'), '/');
	const remember = formData.get('remember');

	if (!validateEmail(email)) {
		return json({ errors: { email: 'Email is invalid', password: null } }, { status: 400 });
	}

	if (typeof password !== 'string' || password.length === 0) {
		return json({ errors: { email: null, password: 'Password is required' } }, { status: 400 });
	}

	if (password.length < 8) {
		return json({ errors: { email: null, password: 'Password is too short' } }, { status: 400 });
	}

	const user = await verifyLogin(email, password);

	if (!user) {
		return json({ errors: { email: 'Invalid email or password', password: null } }, { status: 400 });
	}

	return createUserSession({
		redirectTo,
		remember: remember === 'on',
		request,
		userId: user.ID
	});
};

export const meta: V2_MetaFunction = () => [{ title: 'Login' }];

const LoginPage = () => {
	const [searchParams] = useSearchParams();
	const redirectTo = searchParams.get('redirectTo') || '/';
	const actionData = useActionData<typeof action>();
	const emailRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (actionData?.errors?.email) {
			emailRef.current?.focus();
		} else if (actionData?.errors?.password) {
			passwordRef.current?.focus();
		}
	}, [actionData]);

	return (
		<div className="flex min-h-full flex-col justify-center">
			<div className="mx-auto w-full max-w-md px-8">
				<Form method="post" className="space-y-6">
					<div>
						<Input
							ref={emailRef}
							id="email"
							label="Email address"
							required
							name="email"
							type="email"
							autoComplete="email"
							aria-invalid={actionData?.errors?.email ? true : undefined}
							aria-describedby="email-error"
						/>
						{actionData?.errors?.email ? (
							<div className="pt-1 text-red-700" id="email-error">
								{actionData.errors.email}
							</div>
						) : null}
					</div>

					<div>
						<Input
							id="password"
							ref={passwordRef}
							label="Password"
							name="password"
							type="password"
							autoComplete="current-password"
							aria-invalid={actionData?.errors?.password ? true : undefined}
							aria-describedby="password-error"
						/>
						{actionData?.errors?.password ? (
							<div className="pt-1 text-red-700" id="password-error">
								{actionData.errors.password}
							</div>
						) : null}
					</div>

					<input type="hidden" name="redirectTo" value={redirectTo} />
					<Button type="submit">Log in</Button>
					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember"
								name="remember"
								type="checkbox"
								className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
							/>
							<label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
								Remember me
							</label>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
};

export default LoginPage;
