import { IsNotEmpty } from "class-validator";

export class DeleteCommunityContestRequestDTO {

  @IsNotEmpty()
  communityId: string;
  @IsNotEmpty()
  contestId: string;
}
