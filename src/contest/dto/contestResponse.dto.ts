export interface ContestResponseDto {
    id: number;
    name: string;
    maxRoomCapacity: number;
    startingMoney: number;
    startDate: Date;
    endDate: Date;
    rooms: RoomDto[];
}