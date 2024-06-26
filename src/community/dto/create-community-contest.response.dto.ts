export class CreateCommunityContestResponse {
  id: number;
  name: string;
  maxRoomCapacity: number;
  startingMoney: number;
  startingShares: number;
  startDate: Date;
  endDate: Date;
  rooms: RoomDto[];
}
