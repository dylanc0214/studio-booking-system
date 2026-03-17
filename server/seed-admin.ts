import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'admin@underrated.com';
    const plainPassword = '05231616';

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log(`Admin account ${adminEmail} already exists. Skipping.`);
        return;
    }

    const password_hash = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.user.create({
        data: {
            name: 'Admin',
            email: adminEmail,
            password_hash,
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user specifically seeded:');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
