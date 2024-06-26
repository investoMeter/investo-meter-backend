import { Module } from "@nestjs/common";
import { CommunityService } from "./community.service";
import { CommunityController } from "./community.controller";
import { FeedModule } from "./feed";
import { AuthModule } from "src/auth";
import { PrismaService } from "src/prisma";

@Module({
  imports: [FeedModule, AuthModule],
  providers: [CommunityService, PrismaService],
  controllers: [CommunityController],
})
export class CommunityModule {}
