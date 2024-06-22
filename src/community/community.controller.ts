import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/auth";
import { CommunityService } from "./community.service";

@Controller("community")
@ApiTags("communities")
export class CommunityController {
  constructor(
    private service: CommunityService,
    private authService: AuthService,
  ) {}
  async createCommunity() {}
  async getMyCommunities() {}
  async getCommunitiesToJoin() {}
  async joinCommunity() {}
  async leaveCommunity() {}
  async getCommunityMembers() {}
}
