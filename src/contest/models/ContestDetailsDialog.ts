export class ContestDetailsDialog {
  startDate: Date;
  duration: number;
  creator: string;
  availableRooms: {
    id: number;
    number: number;
    _count: { memberships: number };
  }[];
  totalJoinedPlayers: number;
}
