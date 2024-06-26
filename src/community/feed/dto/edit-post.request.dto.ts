import { IsNotEmpty, IsString } from "class-validator";

export class EditPostRequest {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  communityId: string;
}
