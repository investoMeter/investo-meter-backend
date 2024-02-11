import { ContentItem } from './content-item.level';

export class TutorialInfo {
  id: number;

  title: String;

  content: ContentItem[];

  imageStorageId?: String;

  published: Boolean;
}
