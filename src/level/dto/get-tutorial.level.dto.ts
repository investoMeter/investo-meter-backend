import { ContentItem } from '../models/content-item.level';

export class GetTutorialDto {
  id: number;

  title: string;

  content: ContentItem[];

  imageStorageId?: string;
}
