import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function seedContestStocksData() {
  try {
    const jsonPath = path.join(__dirname, '../stock_data.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const contestStockData = JSON.parse(jsonData);
    if ((await prisma.contestStock.count()) == 0) {
      for (const data of contestStockData) {
        await prisma.contestStock.create({
          data: {
            name: data.name,
            symbol: data.symbol,
          },
        });
      }
    }

    const jsonPath2 = path.join(__dirname, '../player_data.json');
    const jsonData2 = await fs.readFile(jsonPath2, 'utf-8');
    const playersData = JSON.parse(jsonData2);
    if ((await prisma.user.count()) == 0) {
      for (const user of playersData) {
        const newUser = await prisma.user.create({
          data: {
            username: user.username,
            email: user.email,
            salt: user.password,
            hashedPassword: user.password,
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
