// import { Content } from '@prisma/client';
import { ContentItem } from '../models/content-item.level';
import { Type } from 'class-transformer';

export class GetTutorialDto {
  id: number;

  title: string;
  @Type(() => ContentItem)
  content: ContentItem[];

  imageStorageId?: string;
}
