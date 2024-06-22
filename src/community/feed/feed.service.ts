import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma";

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}
}
