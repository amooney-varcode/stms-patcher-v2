import { prisma } from '~/db.server';

const usersRef = prisma.users;

export const getAllUsers = async () =>
	usersRef.findMany().then((users) =>
		users.map((user) => {
			const { Password: _, ...userWithoutPassword } = user;
			return userWithoutPassword;
		})
	);
