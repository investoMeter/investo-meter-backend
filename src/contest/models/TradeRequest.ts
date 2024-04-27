export interface TradeRequest {
  quantity: number;
  price: number;
  userId: string;
  contestId: number;
  roomNumber: number;
  timestamp: Date;
  stockId: number;
}
