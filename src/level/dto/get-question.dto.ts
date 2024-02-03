import { TradeType } from 'src/common';
import { LevelStock } from '../models';

export class getQuestionDto {
  id: number;
  answer: TradeType;
  levelStock?: LevelStock;
  timestamp: Date;
}
