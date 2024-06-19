// import { Content } from '@prisma/client';
import { GetContentDto } from './get-content.dto';
import { Type } from 'class-transformer';

export class GetTutorialDto {
  id: number;

  title: string;
  @Type(() => GetContentDto)
  content: GetContentDto[];

  imageStorageId?: string;
}
