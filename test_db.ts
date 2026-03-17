import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Date blocks:", await prisma.dateBlock.findMany());
    console.log("Bookings:", await prisma.booking.findMany());
}
main().finally(() => prisma.$disconnect());
