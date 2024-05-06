import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {  IsNotEmpty, IsString, IsEnum } from "class-validator";
import { ReportSeverity ,ReportType} from '@prisma/client';


export class CreateReportDto {
  

    @IsString({ message: 'invalid report content' })
    @IsNotEmpty()
    content: string;

    @IsString({ message: 'invalid report title' })
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty()
    title: string;

    @IsEnum(ReportType)
    @ApiProperty({ enum: ReportType })
    type: ReportType;

    @IsEnum(ReportSeverity)
    @ApiProperty({ enum: ReportSeverity })
    severity: ReportSeverity;


    

}