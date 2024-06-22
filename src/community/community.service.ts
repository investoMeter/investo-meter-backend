import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma";

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}
}
