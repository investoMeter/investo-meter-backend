import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsPositive, IsString, Matches } from "class-validator";


export class TradeRequestDto {

    @IsPositive()
    @IsInt()
    @IsNotEmpty()
    quantity: number

    @IsPositive()
    @IsNotEmpty()
    price: number

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value?.trim())
    @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    @ApiProperty({ example: '2024-04-07T12:30:00', description: 'The start date in the format YYYY-MM-DDTHH:MM:SS' })
    timestamp: string

    @IsPositive()
    @IsNotEmpty()
    roomId: number

    @IsPositive()
    @IsNotEmpty()
    contestId: number

    @IsPositive()
    @IsNotEmpty()
    stockId: number
}