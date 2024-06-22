import { Module } from "@nestjs/common";
import { CommunityService } from "./community.service";
import { CommunityController } from "./community.controller";
import { FeedModule } from "./feed";

@Module({
  imports: [FeedModule],
  providers: [CommunityService],
  controllers: [CommunityController],
})
export class CommunityModule {}
