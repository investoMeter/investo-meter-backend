import { BasicLevelInfo } from './basic-level-info.level.dto';
import { TutorialInfo } from './tutorial-info.level.dto';

export class GetLevelTutorialDto {
  levelInfo: BasicLevelInfo;
  tutorialInfo: TutorialInfo;
}
