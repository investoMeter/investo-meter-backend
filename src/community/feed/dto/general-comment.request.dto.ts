import { IsNotEmpty, IsString } from "class-validator";

export class CommentRequest {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @IsNotEmpty()
  communityId: string;
}
