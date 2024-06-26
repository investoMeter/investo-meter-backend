import { IsNotEmpty, IsString } from "class-validator";

export class PostRequest {
  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  postId: string;
}
