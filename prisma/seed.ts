import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
	const email = 'rachel@remix.run';

	// cleanup the existing database
	await prisma.users.delete({ where: { email } }).catch(() => {
		// no worries if it doesn't exist yet
	});

	const hashedPassword = await bcrypt.hash('racheliscool', 10);

	const user = await prisma.users.create({
		data: {
			email,
			password: {
				create: {
					hash: hashedPassword
				}
			}
		}
	});

	console.log('Database has been seeded. 🌱');
}

seed()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
