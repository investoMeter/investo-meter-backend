import { ContentItem } from "../models/content-item.level";


export class EditTutorialDto {
  id: number;

  title: string;

  content: ContentItem[];

  levelId: number;

  imageStorageId?: string | null;
}