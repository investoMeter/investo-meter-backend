import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GetFeedRequest {
  @IsNotEmpty()
  @IsString()
  communityId: string;

  @IsNumber()
  page: number = 0;

  @IsNumber()
  take: number = 10;
}
