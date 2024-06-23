import { Injectable } from "@nestjs/common";
import { Player } from "@prisma/client";
import { PrismaService } from "src/prisma";
import { GetPostsDto } from "./dto/get-posts.dto";
import { CommentDto } from "./dto/comment.dto";

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  // get feed
  async getFeed(
    player: Player,
    communityId: string,
    page: number = 0,
    take: number = 10,
  ) {
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const posts = await this.prisma.post.findMany({
      where: {
        communityId: communityId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            userId: true,
          },
        },
        likedBy: true,
      },
      orderBy: { createdAt: "desc" },
      take: take,
      skip: page * take,
    });

    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: posts.map((post) => post.author.userId),
        },
      },
      select: {
        username: true,
        id: true,
      },
    });

    const response: GetPostsDto = { page: page, take: take, posts: [] };

    posts.forEach((post) => {
      response.posts.push({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        authorName:
          users.find((u) => u.id === post.author.userId)?.username || "Unknown",
        authorId: post.author.userId,
        likesCount: post.likedBy.length,
        isLiked: !!post.likedBy.find((like) => like === player.userId)
          ? true
          : false,
      });
    });
    return response;
  }
  // get comments
  async getComments(player: Player, postId: string, communityId: string) {
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }
    const comments = await this.prisma.comment.findMany({
      where: {
        postId: postId,
        communityId: communityId,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
        author: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: comments.map((comment) => comment.author.userId),
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    const response: CommentDto[] = [];
    comments.forEach((comment) => {
      response.push({
        id: comment.id,
        authorId: comment.author.userId,
        authorName:
          users.find((u) => u.id === comment.author.userId)?.username ||
          "Unknown",
        text: comment.text,
        createdAt: comment.createdAt,
      });
    });

    return response;
  }
  // get likes
  // like post
  // unlike post
  // create comment
  // delete comment
  // create post

  //validate if player is in community
  async IsInCommunity(playerId: string, communityId: string): Promise<boolean> {
    const membership = await this.prisma.communityMembership.findFirst({
      where: {
        communityId: communityId,
        userId: playerId,
      },
      select: {
        userId: true,
      },
    });

    return !!membership;
  }
}
