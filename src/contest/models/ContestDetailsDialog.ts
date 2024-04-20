export class ContestDetailsDialog {
  startDate: Date;
  duration: number;
  creator: string;
  availableRooms: {
    roomNumber: number;
    _count: { memberships: number };
  }[];
  totalJoinedPlayers: number;
}
