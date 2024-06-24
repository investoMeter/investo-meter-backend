import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "src/auth";
import { FeedService } from "./feed.service";
import { AtGuard } from "src/auth/guards";
import { CreatePostRequest } from "./dto/create-post.request.dto";
import { EditPostRequest } from "./dto/edit-post.request.dto";
import { CreateCommentRequest } from "./dto/create-comment.request.dto";
import { EditCommentRequest } from "./dto/edit-comment.request.dto";
import { CommentRequest } from "./dto/general-comment.request.dto";
import { PostRequest } from "./dto/general-post.request.dto";

@Controller("feed")
@ApiTags("Community Feed")
export class FeedController {
  constructor(
    private authService: AuthService,
    private feedService: FeedService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getAllFeed(
    @Req() req: any,
    @Query("communityId") communityId: string,
    @Query("page", ParseIntPipe) page: number = 0,
    @Query("take", ParseIntPipe) take: number = 10,
  ) {
    const player = await this.authService.playerResolver(req.user.sub);
    return await this.feedService.getFeed(player, { communityId, page, take });
  }

  @Post("post")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async createPost(@Req() req: any, @Body() requestBody: CreatePostRequest) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.createPost(player, requestBody);
  }

  @Put("post")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async editPost(@Req() req: any, @Body() requestBody: EditPostRequest) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.editPost(player, requestBody);
  }

  @Delete("post")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async deletePost(
    @Req() req: any,
    @Query("communityId") communityId: string,
    @Query("postId") postId: string,
  ) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.deletePost(player, { communityId, postId });
  }

  @Get("post/comment")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async getComment(
    @Req() req: any,
    @Query("communityId") communityId: string,
    @Query("postId") postId: string,
  ) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.getComments(player, { communityId, postId });
  }

  @Post("post/comment")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async createComment(
    @Req() req: any,
    @Body() requestBody: CreateCommentRequest,
  ) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.createComment(player, requestBody);
  }

  @Put("post/comment")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async editComment(@Req() req: any, @Body() requestBody: EditCommentRequest) {
    const player = await this.authService.playerResolver(req.user.sub);
    return await this.feedService.editComment(player, requestBody);
  }

  @Delete("post/comment")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async deleteComment(@Req() req: any, @Body() requestBody: CommentRequest) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.deleteComment(player, requestBody);
  }

  @Post("post/like")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async likePost(@Req() req: any, @Body() requestBody: PostRequest) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.likePost(player, requestBody);
  }

  @Delete("post/like")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AtGuard)
  @ApiBearerAuth()
  async unlikePost(@Req() req: any, @Body() requestBody: PostRequest) {
    const player = await this.authService.playerResolver(req.user.sub);
    return this.feedService.unlikePost(player, requestBody);
  }
}
