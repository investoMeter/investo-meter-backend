import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString} from 'class-validator';
import { CommunityReportIssueType, CommunityReportSubject } from '@prisma/client';

export class CreateCommReportDto {
  @ApiProperty({
    description: 'Description of the Technical Report',
    example: 'The buy botton is not working',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'invalid report content' })
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Title of the Technical Report',
    example: 'buy botton bug',
  })
  @IsString({ message: 'invalid report title' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  title: string;

  @IsEnum(CommunityReportIssueType)
  @ApiProperty({ enum: CommunityReportIssueType })
  issueType: CommunityReportIssueType;

  @IsEnum(CommunityReportSubject)
  @ApiProperty({ enum: CommunityReportSubject })
  subject: CommunityReportSubject;

  @IsString({ message: 'invalid subject ID' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  subjectId: string;
}
