import process from 'process';

import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../generated/index';
import { SALT_ROUNDS } from '../../app/constants';

const prisma = new PrismaClient();

const { NX_PUBLIC_ALPHA_USER_EMAIL, NX_PUBLIC_ALPHA_USER_PASSWORD } =
  process.env;

async function main() {
  const hashedPassword = await bcrypt.hash(
    NX_PUBLIC_ALPHA_USER_PASSWORD,
    SALT_ROUNDS
  );

  await prisma.user.upsert({
    where: { email: NX_PUBLIC_ALPHA_USER_EMAIL },
    update: {},
    create: {
      email: NX_PUBLIC_ALPHA_USER_EMAIL,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      original_email: NX_PUBLIC_ALPHA_USER_EMAIL,
    },
  });

  console.log('Successful db seeding');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
