import { IsDate, IsNotEmpty, IsString } from "class-validator";

export class CommentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsString()
  @IsNotEmpty()
  authorName: string;

  @IsString()
  @IsNotEmpty()
  authorId: string;
}
