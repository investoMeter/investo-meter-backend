import { levelStockPrice } from './level-stock-price';

export class LevelStock {
  id: number;
  name: string;
  symbol: string;
  priceHistory: levelStockPrice[];
}
