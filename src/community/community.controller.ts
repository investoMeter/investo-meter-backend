import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/auth";
import { CommunityService } from "./community.service";
import { AtGuard } from "src/auth/guards";
import { CreateCommunityRequest } from "./dto/create-community.request.dto";
import { CommunityActionRequest } from "./dto/community-action.request.dto";

@Controller("community")
@ApiTags("Communities")
export class CommunityController {
  constructor(
    private service: CommunityService,
    private authService: AuthService,
  ) {}

  @Post("create-community")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async createCommunity(
    @Req() req: any,
    @Body() createCommunityRequestDTO: CreateCommunityRequest,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.createCommunity(player, createCommunityRequestDTO);
  }

  @Get("owned-communities")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getCommunitiesForOwner(@Req() req: any) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.getOwnedCommunities(player);
  }

  @Get("joined-communities")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getJoinedCommunities(@Req() req: any) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.getJoinedCommunities(player);
  }

  @Get("communities-to-join")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getCommunitiesToJoin(@Req() req: any) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.getCommunitiesToJoin(player);
  }

  @Post("join-community")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async joinCommunity(
    @Req() req: any,
    @Body() joinCommunityRequestDTO: CommunityActionRequest,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.joinCommunity(player, joinCommunityRequestDTO);
  }

  @Post("leave-community")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async leaveCommunity(
    @Req() req: any,
    @Body() leaveCommunityDto: CommunityActionRequest,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.leaveCommunity(player, leaveCommunityDto);
  }

  @Get("members/:communityId")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getCommunityMembers(
    @Req() req: any,
    @Param("communityId") communityId: string,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.getCommunityMembers(player, communityId);
  }
}
