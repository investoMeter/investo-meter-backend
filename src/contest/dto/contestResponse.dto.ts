export interface ContestResponseDto {
    id: number;
    name: string;
    maxRoomCapacity: number;
    startingMoney: number;
    startingShares: number;
    startDate: Date;
    endDate: Date;
    rooms: RoomDto[];
}