import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    Matches,
} from 'class-validator';

export class EditContestDto {
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @ApiProperty({
        example: 1,
        description: 'The ID of the contest',
    })
    id: number;

    @IsString({ message: 'invalid contest name' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty()
    @ApiProperty({
        example: 'My Contest',
        description: 'The name of the contest',
    })
    name: string;

    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @ApiProperty({
        example: 100,
        description: 'The maximum room capacity of the contest',
    })
    maxRoomCapacity: number;

    @IsNotEmpty()
    @IsPositive()
    @ApiProperty({
        example: 1000,
        description: 'The starting money for the contest',
    })
    startingMoney: number;

    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @ApiProperty({
        example: 100,
        description: 'The starting shares for the contest',
    })
    startingShares: number;

    // YYYY-MM-DDTHH:MM:SS
    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    @ApiProperty({
        example: '2024-04-07T12:30:00',
        description: 'The start date in the format YYYY-MM-DDTHH:MM:SS',
    })
    startDate: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    @ApiProperty({
        example: '2024-04-10T12:30:00',
        description: 'The end date in the format YYYY-MM-DDTHH:MM:SS',
    })
    endDate: string;
}
