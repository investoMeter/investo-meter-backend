import { IsNotEmpty, IsString } from "class-validator";

export class CreatePostRequest {
  @IsString()
  @IsNotEmpty()
  communityId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
