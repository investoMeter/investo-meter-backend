import { GetContentDto } from "./get-content.dto";

export class EditTutorialDto {
  id: number;

  title: string;

  content: GetContentDto[];

  levelId: number;

  imageStorageId?: string;
}