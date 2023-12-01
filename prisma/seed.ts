import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';

const prisma = new PrismaClient();

async function seedContestStocksData() {
    try {
        const jsonPath = path.join(__dirname, '../stock_data.json');
        const jsonData = await fs.readFile(jsonPath, 'utf-8');
        const stockData = JSON.parse(jsonData);

        // console.log('stockData.length: ', stockData.length);

        // await prisma.stock.deleteMany(); //! uncomment if we need to empty the db before seeding

        for (const data of stockData) {
            const stock = await prisma.stock.create({
                data: {
                    name: data.name,
                    symbol: data.symbol,
                },
            });
        }

        console.log('Seeding is done');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedContestStocksData();
