export class ContestDetailsDialog {
  startDate: Date;
  duration: number;
  creator: string;
  availableRooms: {
    id: number;
    roomNumber: number;
    _count: { memberships: number };
  }[];
  totalJoinedPlayers: number;
}
