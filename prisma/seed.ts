import { PrismaClient, ReportState, TradeType } from "@prisma/client";
import * as path from "path";
import * as fs from "fs/promises";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return { salt, hash: await bcrypt.hash(password, salt) };
}
async function seedContestStocks() {
  if ((await prisma.contestStock.count()) == 0) {
    const jsonPath = path.join(__dirname, "../stock_data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    const contestStockData = JSON.parse(jsonData);

    for (const data of contestStockData) {
      await prisma.contestStock.create({
        data: {
          name: data.name,
          symbol: data.symbol,
          initialPrice: {
            create: {
              open: data.initialPrice.open,
              close: data.initialPrice.close,
              highest: data.initialPrice.highest,
              lowest: data.initialPrice.lowest,
              volume: data.initialPrice.volume,
            },
          },
        },
      });
    }
  }
}
async function seedLevels() {
  if ((await prisma.level.count()) == 0) {
    const jsonPath = path.join(__dirname, "../tutorials_data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    const tutorials = JSON.parse(jsonData);

    const jsonPath1 = path.join(__dirname, "../questions_stocks_combined.json");
    const jsonData1 = await fs.readFile(jsonPath1, "utf-8");
    const questions = JSON.parse(jsonData1);

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
      console.log("level", i + 1, "seeded");
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
              close: ph.Close,
              highest: ph.High,
              lowest: ph.Low,
              open: ph.Open,
            },
          });
        }
      }
      console.log("question", k + 1, "seeded");
    }
  }
}

async function seedPlayers() {
  if ((await prisma.player.count()) == 0) {
    const jsonPath = path.join(__dirname, "../player_data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
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

      console.log("player " + newUser.id + " seeded.");
    }
  }
}

async function seedAdmins() {
  if ((await prisma.admin.count()) == 0) {
    const jsonPath = path.join(__dirname, "../admin_data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    const adminsData = JSON.parse(jsonData);
    for (const user of adminsData) {
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

      await prisma.admin.create({
        data: {
          userId: newUser.id,
        },
      });
    }
  }
}

async function seedReports() {
  if ((await prisma.report.count()) == 0) {
    const jsonPath = path.join(__dirname, "../tech-reports_data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    const techReportsData = JSON.parse(jsonData);

    let i = 1;

    for (const tech_report of techReportsData) {
      const players = await prisma.player.findMany();
      const playerIds = players.map((player) => player.userId);

      const dateObject = new Date(Date.now());
      dateObject.setHours(dateObject.getHours() + 3);
      await prisma.report.create({
        data: {
          content: tech_report.content,
          creatorId: playerIds[Math.floor(Math.random() * playerIds.length)],
          title: tech_report.title,
          type: tech_report.type,
          severity: tech_report.severity,
          createdAt: dateObject,
          state: ReportState.OPEN,
        },
      });
      console.log("technical report" + i + " seeded.");
      i += 1;
    }
  }
}

async function seedFeedbacks() {
  if ((await prisma.feedback.count()) == 0) {
    const jsonPath = path.join(__dirname, "../feedbacks_data.json");
    const jsonData = await fs.readFile(jsonPath, "utf-8");
    const feedbacks = JSON.parse(jsonData);

    let i = 1;

    for (const feedback of feedbacks) {
      const players = await prisma.player.findMany();
      const playerIds = players.map((player) => player.userId);

      const dateObject = new Date(Date.now());
      dateObject.setHours(dateObject.getHours() + 3);
      await prisma.feedback.create({
        data: {
          content: feedback.content,
          playerId: playerIds[Math.floor(Math.random() * playerIds.length)],
          about: feedback.about,
          rating: feedback.rating,
          createdAt: dateObject,
        },
      });
      console.log("feedback" + i + " seeded.");
      i += 1;
    }
  }
}

async function seedContests() {
  if ((await prisma.contest.count()) == 0) {
    let jsonPath = path.join(__dirname, "../contests_data.json");
    let jsonData = await fs.readFile(jsonPath, "utf-8");
    const contestsData = JSON.parse(jsonData);
    const contestCreator = await prisma.user.findFirst({
      select: { id: true },
    });

    for (const contest of contestsData) {
      const stocks = await prisma.contestStock.findMany({ take: 5 });
      const contestx = await prisma.contest.create({
        data: {
          name: contest.name,
          maxRoomCapacity: contest.maxRoomCapacity,
          startingMoney: contest.startingMoney,
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 2)),
          creator: { connect: { id: contestCreator?.id } },
          startingShares: contest.startingShares,
        },
        select: { id: true },
      });

      await prisma.contestContestStock.createMany({
        data: stocks.map((stock) => ({
          contestId: contestx.id,
          contestStockId: stock.id,
        })),
      });
    }

    jsonPath = path.join(__dirname, "../contests_rooms_data.json");
    jsonData = await fs.readFile(jsonPath, "utf-8");
    const contestsRoomsData = JSON.parse(jsonData);
    for (const contestRoom of contestsRoomsData) {
      const contest = await prisma.contest.findFirst({
        select: { id: true },
      });
      await prisma.room.create({
        data: {
          roomNumber: contestRoom.roomNumber,
          contest: { connect: { id: contest?.id } },
          currentCapacity: contestRoom.currentCapacity,
        },
      });
    }

    jsonPath = path.join(__dirname, "../contests_membership_data.json");
    jsonData = await fs.readFile(jsonPath, "utf-8");
    const contestsMembershipData = JSON.parse(jsonData);
    let i = 0;
    for (const contestMembership of contestsMembershipData) {
      const contest = await prisma.contest.findFirst({
        select: { id: true },
      });

      if (!contest) throw new Error("Contest not found");
      const players = await prisma.player.findMany();
      const playerIds = players.map((player) => player.userId);
      await prisma.contestMembership.create({
        data: {
          player: {
            connect: { userId: playerIds[i] },
          },
          room: {
            connect: {
              contestId_roomNumber: {
                contestId: contest?.id,
                roomNumber: contestMembership.roomNumber,
              },
            },
          },
          currentBalance: contestMembership.currentBalance,
        },
      });
      i++;
    }
    jsonPath = path.join(
      __dirname,
      "../initial_contests_stock_data_price.json",
    );
    jsonData = await fs.readFile(jsonPath, "utf-8");
    const initialContestStockPrices = JSON.parse(jsonData);
    const contest = (await prisma.contest.findFirst({
      select: {
        id: true,
      },
    })) || { id: 1 };
    for (const contestStockPrice of initialContestStockPrices) {
      await prisma.stockHistory.create({
        data: {
          ContestStockPrice: {
            createMany: {
              data: [
                {
                  open: contestStockPrice.open + 10,
                  highest: contestStockPrice.highest + 10,
                  close: contestStockPrice.close + 10,
                  volume: contestStockPrice.volume,
                  lowest: contestStockPrice.lowest,
                },
                {
                  open: contestStockPrice.open,
                  highest: contestStockPrice.highest,
                  close: contestStockPrice.close,
                  volume: contestStockPrice.volume,
                  lowest: contestStockPrice.lowest,
                },
                {
                  open: contestStockPrice.open + 5,
                  highest: contestStockPrice.highest + 7,
                  close: contestStockPrice.close + 6,
                  volume: contestStockPrice.volume,
                  lowest: contestStockPrice.lowest + 4,
                },
              ],
            },
          },
          Room: {
            connect: {
              contestId_roomNumber: {
                contestId: contest.id,
                roomNumber: contestStockPrice.roomNumber,
              },
            },
          },
          currentShares: 1000,
          stock: {
            connect: {
              contestId_contestStockId: {
                contestId: contest.id,
                contestStockId: contestStockPrice.contestStockId,
              },
            },
          },
        },
      });
    }

    jsonPath = path.join(__dirname, "../upcoming_contests.json");
    jsonData = await fs.readFile(jsonPath, "utf-8");
    const upcomingContests = JSON.parse(jsonData);
    i = 1;
    for (const upcomingContest of upcomingContests) {
      const currentContest = await prisma.contest.create({
        data: {
          name: upcomingContest.name,
          maxRoomCapacity: upcomingContest.room_capacity,
          startingMoney: upcomingContest.starting_money,
          startDate: new Date(new Date().setDate(new Date().getDate() + i)),
          endDate: new Date(new Date().setDate(new Date().getDate() + i + 1)),
          creator: { connect: { id: contestCreator?.id } },
          startingShares: upcomingContest.starting_shares,
        },
        select: { id: true, startDate: true },
      });
      const createdStocks = [];
      for (const stockId of upcomingContest.stocks) {
        const stock = await prisma.contestContestStock.create({
          data: {
            contest: { connect: { id: currentContest.id } },
            contestStock: { connect: { id: stockId } },
          },
          select: {
            contestStock: { select: { id: true, initialPrice: true } },
          },
        });
        createdStocks.push(stock);
      }
      const createdRooms = [];
      for (const roomNumber of upcomingContest.rooms) {
        const room = await prisma.room.create({
          data: {
            roomNumber: roomNumber,
            contest: { connect: { id: currentContest.id } },
          },
          select: { roomNumber: true },
        });
        createdRooms.push(room);
      }

      for (const room of createdRooms) {
        for (const stock of createdStocks) {
          await prisma.stockHistory.create({
            data: {
              ContestStockPrice: {
                create: {
                  open: stock.contestStock.initialPrice.open,
                  close: stock.contestStock.initialPrice.close,
                  highest: stock.contestStock.initialPrice.highest,
                  lowest: stock.contestStock.initialPrice.lowest,
                  volume: stock.contestStock.initialPrice.volume,
                  timeStamp: currentContest.startDate,
                },
              },
              Room: {
                connect: {
                  contestId_roomNumber: {
                    contestId: currentContest.id,
                    roomNumber: room.roomNumber,
                  },
                },
              },
              currentShares: 1000,
              stock: {
                connect: {
                  contestId_contestStockId: {
                    contestId: currentContest.id,
                    contestStockId: stock.contestStock.id,
                  },
                },
              },
            },
          });
        }
      }
      i++;
    }
  }
}

async function seedCommunity() {
  if ((await prisma.community.count()) == 0) {
    let jsonPath = path.join(__dirname, "../community_data.json");
    let jsonData = await fs.readFile(jsonPath, "utf-8");
    const communityData = JSON.parse(jsonData);

    // get first 4 users as communitycreators
    const users = await prisma.user.findMany({ take: 4 });
    const communityCreators = users.map((user) => user.id);

    let i = 0;
    let communities: any = [];
    for (const community of communityData) {
      const newCommunity = await prisma.community.create({
        data: {
          name: community.name,
          ownerId: communityCreators[i],
        },
      });

      // create membership for the owner
      await prisma.communityMembership.create({
        data: {
          communityId: newCommunity.id,
          userId: communityCreators[i],
          isOwner: true,
        },
      });

      const players = await prisma.player.findMany({
        where: { userId: { not: communityCreators[i] } },
      });

      const playerIds = players.map((player) => player.userId);
      const randomPlayers = playerIds
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      for (const playerId of randomPlayers) {
        if (playerId) {
          await prisma.communityMembership.create({
            data: {
              communityId: newCommunity.id,
              userId: playerId,
            },
          });
        }
      }

      communities.push(newCommunity);
      i++;
    }

    jsonPath = path.join(__dirname, "../feed_data.json");
    jsonData = await fs.readFile(jsonPath, "utf-8");
    const feedData = JSON.parse(jsonData);

    // add 2 posts to each community
    for (const community of communities) {
      const members = await prisma.communityMembership.findMany({
        where: { communityId: community.id },
        take: 5,
        select: { userId: true },
      });

      // take a random player from the community
      for (const post of feedData) {
        const randomMember =
          members[Math.floor(Math.random() * members.length)];
        await prisma.post.create({
          data: {
            authorId: randomMember.userId,
            communityId: community.id,
            content: post.content,
            likedBy: [],
          },
        });
      }
    }
  }
}

async function seedData() {
  try {
    await seedContestStocks();
    console.log("contest stocks seeding is done");
    // ______________________________________________________________________________________
    await seedLevels();
    console.log("levels seeding is done");

    // ______________________________________________________________________________________
    await seedPlayers();
    console.log("players seeding is done");

    // ______________________________________________________________________________________
    await seedAdmins();
    console.log("admins seeding is done");

    // ______________________________________________________________________________________
    await seedReports();
    console.log("technical reports seeding is done");

    // ______________________________________________________________________________________
    await seedFeedbacks();
    console.log("feedbacks seeding is done");

    // ______________________________________________________________________________________
    await seedContests();
    console.log("contest seeding is done");
    // --------------------------------------------------------------------------------------
    await seedCommunity();
    console.log("community seeding is done");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
  process.exit(0);
}

seedData();
