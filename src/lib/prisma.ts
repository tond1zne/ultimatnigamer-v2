import { PrismaClient } from "@prisma/client";

const g = global as unknown as { prisma?: PrismaClient };

export const prisma = g.prisma ?? new PrismaClient({ log: ["error"] });

// Cache i v produkci - na serverless se tím šetří spojení do databáze.
g.prisma = prisma;
