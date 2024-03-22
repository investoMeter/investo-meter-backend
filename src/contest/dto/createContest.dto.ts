import { Transform } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, IsDateString, IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateContestDto {
    @IsString({ message: 'invalid contest name' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    maxRoomCapacity: number

    @IsNotEmpty()
    @IsPositive()
    startingMoney: number

    // YYYY-MM-DDTHH:MM:SS.SSSZ 
    @IsDateString()
    startDate: Date;

    @IsDateString()
    endDate: Date;

    @IsString({ message: 'invalid creator id' })
    creatorId: string;

    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    numberOfRooms: number;

    @ArrayNotEmpty()
    @ArrayMinSize(5)
    stocksIds: number[];
}