import { IsNotEmpty, IsString } from "class-validator";

export class EditCommentRequest {
  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
