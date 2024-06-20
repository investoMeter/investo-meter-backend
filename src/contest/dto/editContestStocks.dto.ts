import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    ArrayMinSize,
    IsInt,
    IsNotEmpty,
    IsPositive,
} from 'class-validator';

export class EditContestStocksDto {
    @IsNotEmpty()
    @IsPositive()
    @IsInt()
    @ApiProperty({
        example: 1,
        description: 'The ID of the contest',
    })
    id: number;

    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @ApiProperty({
        example: [1, 2, 3, 4, 5],
        description: 'The list of stock IDs to be added or removed from the contest',
    })
    stockIds: number[];
}
