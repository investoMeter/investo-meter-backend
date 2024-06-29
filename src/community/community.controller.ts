import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/auth";
import { CommunityService } from "./community.service";
import { AtGuard } from "src/auth/guards";
import { CreateCommunityRequest } from "./dto/create-community.request.dto";
import { CommunityActionRequest } from "./dto/community-action.request.dto";
import { CreateCommunityContestRequest } from "./dto/create-community-contest.request.dto";
import { AdminMemberActionRequestDTO } from "./dto/admin-member-action.request.dto";
import { EditCommunityRequestDTO } from "./dto/edit-community.request.dto";

@Controller("community")
@ApiTags("Communities")
export class CommunityController {
  constructor(
    private service: CommunityService,
    private authService: AuthService,
  ) {}

  @Post()
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

  @Put()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async editCommunity(
    @Req() req: any,
    @Body() editCommunityRequestDTO: EditCommunityRequestDTO,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.editCommunity(player, editCommunityRequestDTO);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async deleteCommunity(
    @Req() req: any,
    @Body() deleteCommunityRequestDTO: CommunityActionRequest,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.deleteCommunity(player, deleteCommunityRequestDTO);
  }

  @Post("create-contest")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async createCommunityContest(
    @Req() req: any,
    @Body() createCommunityContestDTO: CreateCommunityContestRequest,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.createCommunityContest(
      player,
      createCommunityContestDTO,
    );
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

  @Post("add-member")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async addMember(
    @Req() req: any,
    @Body() addMemberDto: AdminMemberActionRequestDTO,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.addCommunityMember(player, addMemberDto);
  }

  @Post("remove-member")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async removeMember(
    @Req() req: any,
    @Body() removeMemberDto: AdminMemberActionRequestDTO,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.removeCommunityMember(player, removeMemberDto);
  }

  @Delete("community-contest")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async deleteCommunityContest(
    @Req() req: any,
    @Query("contestId") contestId: string,
    @Query("communityId") communityId: string,
  ) {
    const player = await this.authService.playerResolver((req as any).user.sub);
    return this.service.deleteCommunityContest(
      player,
      parseInt(contestId),
      communityId,
    );
  }
}
