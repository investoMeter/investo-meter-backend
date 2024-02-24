import { PrismaClient, TradeType } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return { salt, hash: await bcrypt.hash(password, salt) };
}

async function seedData() {
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
    console.log('contest data seeding is done');
    if ((await prisma.level.count()) == 0) {
      const jsonPath1 = path.join(__dirname, '../tutorials_data.json');
      const jsonData1 = await fs.readFile(jsonPath1, 'utf-8');
      const tutorials = JSON.parse(jsonData1);

      const jsonPath2 = path.join(
        __dirname,
        '../questions_stocks_combined.json',
      );
      const jsonData2 = await fs.readFile(jsonPath2, 'utf-8');
      const questions = JSON.parse(jsonData2);
      // create level
      for (let i = 0; i < tutorials.length; i++) {
        const tutorial = tutorials[i];
        const level = await prisma.level.create({
          data: {
            number: i + 1,
            patternName: tutorial.pattern_name,
            isActive: true,
            tutorial: {
              create: {
                title: tutorial.pattern_name,
                published: true,
              },
            },
          },
          include: { tutorial: true },
        });

        if (level.tutorial) {
          // fill tutorial content
          for (let j = 0; j < tutorial.sub_titles.length; j++) {
            await prisma.content.create({
              data: {
                subTitle: tutorial.sub_titles[j],
                description: tutorial.content[j],
                tutorialId: level.tutorial.id,
              },
            });
          }
        }
        console.log('level', i + 1, 'seeded');
      }

      // create questions
      for (let k = 0; k < questions.length; k++) {
        const question = questions[k];
        const question_db = await prisma.levelQuestion.create({
          data: {
            answer: question.answer ? TradeType.BUY : TradeType.SELL,
            position: (k % 5) + 1,
            timestamp: new Date(question.timestamp),
            levelId: question.level,
            levelStock: {
              create: {
                name: question.company_name,
                symbol: question.symbol,
              },
            },
          },
          include: { levelStock: true },
        });
        if (question_db.levelStock) {
          // fill stock price history
          for (let j = 0; j < question.price_history.length; j++) {
            const ph = question.price_history[j];
            await prisma.levelStockPrice.create({
              data: {
                levelStockId: question_db.levelStock.id,
                timeStamp: new Date(ph.Date),
                volume: ph.Volume,
                closePrice: ph.Close,
                highestPrice: ph.High,
                lowestPrice: ph.Low,
                openPrice: ph.Open,
              },
            });
          }
        }
        console.log('question', k + 1, 'seeded');
      }
    }
    console.log('levels seeding is done');

    if ((await prisma.user.count()) == 0) {
      const jsonPath = path.join(__dirname, '../player_data.json');
      const jsonData = await fs.readFile(jsonPath, 'utf-8');
      const playersData = JSON.parse(jsonData);
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
            levelMemberships: {
              create: {
                level: { connect: { number: 1 } },
                failuresCount: 0,
                passedAt: null,
              },
            },
          },
        });
      }
    }
    console.log('players seeding is done');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
  process.exit(0);
}

seedData();
