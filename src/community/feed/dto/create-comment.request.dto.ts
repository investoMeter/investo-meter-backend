import { IsString, IsNotEmpty } from "class-validator";

export class CreateCommentRequest {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  communityId: string;
}
