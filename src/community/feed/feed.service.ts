import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "src/prisma";
import { GetPostsDto } from "./dto/get-posts.dto";
import { CommentDto } from "./dto/comment.dto";
import { PostDto } from "./dto/post.dto";
import { ResolvedPlayer } from "src/auth/dto/resolved-player.dto";
import { GetFeedRequest } from "./dto/get-feed.request.dto";
import { CreatePostRequest } from "./dto/create-post.request.dto";
import { PostRequest } from "./dto/general-post.request.dto";
import { EditPostRequest } from "./dto/edit-post.request.dto";
import { CreateCommentRequest } from "./dto/create-comment.request.dto";
import { CommentRequest } from "./dto/general-comment.request.dto";
import { EditCommentRequest } from "./dto/edit-comment.request.dto";

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  // get feed
  async getFeed(player: ResolvedPlayer, request: GetFeedRequest) {
    const { communityId, page, take } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new BadRequestException("Player is not in the community");
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
  // like post
  async likePost(player: ResolvedPlayer, request: PostRequest) {
    const { postId, communityId } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        communityId: communityId,
      },
      select: {
        likedBy: true,
      },
    });

    if (!post) {
      throw new BadRequestException("Post not found");
    }

    if (post.likedBy.find((like) => like === player.userId) !== undefined) {
      throw new BadRequestException("Post already liked");
    }

    await this.prisma.post.update({
      where: {
        id: postId,
        communityId: communityId,
      },
      data: {
        likedBy: {
          push: player.userId,
        },
      },
    });
  }
  // unlike post
  async unlikePost(player: ResolvedPlayer, request: PostRequest) {
    const { postId, communityId } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        communityId: communityId,
      },
      select: {
        likedBy: true,
      },
    });

    if (!post) {
      throw new BadRequestException("Post not found");
    }

    if (post.likedBy.find((like) => like === player.userId) === undefined) {
      throw new BadRequestException("Post already not liked");
    }

    await this.prisma.post.update({
      where: {
        id: postId,
        communityId: communityId,
      },
      data: {
        likedBy: post.likedBy.filter((like) => like !== player.userId),
      },
    });
  }
  // create post
  async createPost(
    player: ResolvedPlayer,
    request: CreatePostRequest,
  ): Promise<PostDto> {
    const { communityId, content } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const post = await this.prisma.post.create({
      data: {
        authorId: player.userId,
        communityId: communityId,
        content: content,
        likedBy: [],
      },
    });

    return {
      id: post.id,
      authorId: post.authorId,
      authorName: player.username,
      content: post.content,
      createdAt: post.createdAt,
      likesCount: 0,
      isLiked: false,
    };
  }
  // delete post
  async deletePost(player: ResolvedPlayer, request: PostRequest) {
    const { postId, communityId } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        communityId: communityId,
      },
      select: {
        authorId: true,
        community: {
          select: {
            ownerId: true,
          },
        },
      },
    });

    if (!post) {
      throw new BadRequestException("Post not found");
    }

    if (
      post.authorId !== player.userId &&
      post.community.ownerId !== player.userId
    ) {
      throw new BadRequestException("Player is not the author of the post");
    }

    await this.prisma.post.delete({
      where: {
        id: postId,
        communityId: communityId,
      },
    });
  }
  // edit post
  async editPost(player: ResolvedPlayer, request: EditPostRequest) {
    const { postId, communityId, content } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        communityId: communityId,
        authorId: player.userId,
      },
      select: {
        authorId: true,
        content: true,
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.authorId !== player.userId) {
      throw new BadRequestException("Player is not the author of the post");
    }

    await this.prisma.post.update({
      where: {
        id: postId,
        communityId: communityId,
      },
      data: {
        content: content,
      },
    });
  }
  // get comments
  async getComments(player: ResolvedPlayer, request: PostRequest) {
    const { postId, communityId } = request;
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
  // create comment
  async createComment(
    player: ResolvedPlayer,
    request: CreateCommentRequest,
  ): Promise<CommentDto> {
    const { text, postId, communityId } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const comment = await this.prisma.comment.create({
      data: {
        authorId: player.userId,
        communityId: communityId,
        postId: postId,
        text: text,
        createdAt: new Date(),
      },
    });

    return {
      id: comment.id,
      authorId: comment.authorId,
      authorName: player.username,
      text: comment.text,
      createdAt: comment.createdAt,
    };
  }
  // delete comment
  async deleteComment(player: ResolvedPlayer, request: CommentRequest) {
    const { postId, commentId, communityId } = request;

    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: postId,
        communityId: communityId,
      },
      select: {
        authorId: true,
        communityId: true,
      },
    });
    const community = await this.prisma.community.findFirst({
      where: {
        id: communityId,
      },
      select: {
        ownerId: true,
      },
    });

    if (!community) {
      throw new BadRequestException("Community not found");
    }

    if (!comment) {
      throw new BadRequestException("Comment not found");
    }

    if (
      comment.authorId !== player.userId &&
      community.ownerId !== player.userId
    ) {
      throw new BadRequestException("Player is not the author of the comment");
    }

    await this.prisma.comment.delete({
      where: {
        id: commentId,
        communityId: communityId,
      },
    });
  }
  // edit comment
  async editComment(player: ResolvedPlayer, request: EditCommentRequest) {
    const { postId, commentId, communityId, text } = request;
    if (!this.IsInCommunity(player.userId, communityId)) {
      throw new Error("Player is not in the community");
    }

    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        communityId: communityId,
        authorId: player.userId,
        postId: postId,
      },
      select: {
        authorId: true,
        text: true,
      },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    if (comment.authorId !== player.userId) {
      throw new BadRequestException("Player is not the author of the comment");
    }

    await this.prisma.comment.update({
      where: {
        id: commentId,
        authorId: player.userId,
        communityId: communityId,
      },
      data: {
        text: text,
      },
    });
  }
  //validate if player is in community
  private async IsInCommunity(
    playerId: string,
    communityId: string,
  ): Promise<boolean> {
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
