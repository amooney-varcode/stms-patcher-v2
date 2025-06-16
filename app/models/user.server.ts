// export async function createUser(email: User['email'], password: string) {
import { Users } from '@prisma/client';
import { prisma } from '~/db.server';

export async function getUserById(id: Users['ID']) {
	return {
		email: 'stms',
		id: 123123
	};
}
export async function verifyLogin(email: string, password: string) {
	if (email === 'stms@varcode.com' && password === 'HelpIneed2023') {
		return { email, ID: 123123 };
	}

	throw new Error('not permitted');
}
