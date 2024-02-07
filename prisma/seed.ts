import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return { salt, hash: await bcrypt.hash(password, salt) };
}

async function seedContestStocksData() {
  try {
    if ((await prisma.contestStock.count()) == 0) {
      const jsonPath = path.join(__dirname, '../stock_data.json');
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const contestStockData = JSON.parse(jsonData);

      for (const data of contestStockData) {
        await prisma.contestStock.create({
          data: {
            name: data.name,
            symbol: data.symbol,
          },
        });
      }
    }

    if ((await prisma.user.count()) == 0) {
      const jsonPath2 = path.join(__dirname, '../player_data.json');
      const jsonData2 = await fs.readFile(jsonPath2, 'utf-8');
      const playersData = JSON.parse(jsonData2);
      for (const user of playersData) {
        const hash = await hashPassword(user.password);
        const newUser = await prisma.user.create({
          data: {
            username: user.username,
            name: user.username,
            email: user.email,
            salt: hash.salt,
            hashedPassword: hash.hash,
          },
          select: { id: true, username: true, email: true },
        });

        await prisma.player.create({
          data: {
            userId: newUser.id,
          },
        });
      }
    }

    console.log('Seeding is done');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
  process.exit(0);
}

seedContestStocksData();
