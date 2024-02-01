import { BasicLevelInfo } from '../models/basic-level-info.level';
import { TutorialInfo } from '../models/tutorial-info.level';

export class GetLevelTutorialDto {
  levelInfo: BasicLevelInfo;
  tutorialInfo: TutorialInfo;
}
