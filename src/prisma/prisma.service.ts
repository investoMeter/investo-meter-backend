import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: { db: { url: process.env.DATABASE_URL} },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  interface Global {
    prismaGlobal: PrismaService; // Define the type explicitly
  }
}
const prisma = (global as any).prismaGlobal ?? prismaClientSingleton();


if (process.env.NODE_ENV !== 'production') (global as any).prismaGlobal = prisma

export default prisma;

