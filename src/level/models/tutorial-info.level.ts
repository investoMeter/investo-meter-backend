export class TutorialInfo {
  id: number;
  title: String;
  content: {
    id: number;
    subTitle: string;
    description: string[];
  }[];
  imageStorageId?: String;
  published: Boolean;
}
