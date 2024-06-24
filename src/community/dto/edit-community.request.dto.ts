import { IsNotEmpty } from "class-validator";

export class EditCommunityRequestDTO {
  @IsNotEmpty()
  communityId: string;

  @IsNotEmpty()
  name: string;
}