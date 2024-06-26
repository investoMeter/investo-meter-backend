import { Module } from "@nestjs/common";
import { FeedService } from "./feed.service";
import { FeedController } from "./feed.controller";
import { AuthModule } from "src/auth";

@Module({
  imports: [AuthModule],
  providers: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
