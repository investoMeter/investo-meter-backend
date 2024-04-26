export interface TradeRequest {
    quantity: number
    price: number
    userId: string
    contestId: number
    roomId: number
    timestamp: Date
    stockId: number
}