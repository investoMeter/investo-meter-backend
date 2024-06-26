import { IsNotEmpty } from "class-validator";

export class AdminMemberActionRequestDTO {
    @IsNotEmpty()
    communityId: string;

    @IsNotEmpty()
    memberId: string;
}
